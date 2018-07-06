const { encodeId } = require("./tag")
const { tx, readSingleValue, LIMIT_INTERVAL, LIMIT_MAX } = require("./db")

function insertUrlTransaction(db, url, ip) {
  return tx(db, async function insertURL(client) {

    let tag = await fetchTag(client, url)
    // shortened URL already exists
    if (tag !== null) {
      return { tag }
    }

    await insertNewIP(client, ip)
    const ipId = await fetchIpId(client, ip)
    // lock the current ip to prevent reace conditions
    await lockIpRow(client, ipId)

    const posts = await countPosts(client, ipId)
    if (posts >= LIMIT_MAX) {
      return { error: "Post limit exceeded" }
    }

    // get the row primary key
    const urlId = await insertUrl(client, url, ipId)
    // compute short url from primary key
    tag = encodeId(urlId)

    await setTag(client, tag, urlId)

    // this return value is propagated from the tx() function as well
    return { tag, remaining: LIMIT_MAX - posts - 1 }
  })
}

function countPosts(client, id) {
  const query = {
    name: "count-posts",
    "text": `SELECT COUNT(*) as count FROM urls
                LEFT JOIN ips
                ON urls.created_by = ips.id
                WHERE ips.id = $1 AND date_created > now() - '${LIMIT_INTERVAL}'::interval;`,
    "values": [id]
  }

  return client.query(query)
    .then(readSingleValue("count"))
}

function setTag(client, url, id) {
  const query = {
    name: "set-tag",
    text: "UPDATE urls SET tag = $1 WHERE id = $2",
    values: [url, id]
  }

  return client.query(query)
}

function insertUrl(client, url, id) {
  const query = {
    name: "insert-url",
    text: "INSERT INTO urls(url, created_by) VALUES($1, $2) RETURNING id",
    values: [url, id]
  }

  return client.query(query)
    .then(readSingleValue("id"))
}

function fetchTag(client, url) {
  const query = {
    name: "fetch-tag",
    text: "SELECT tag FROM urls WHERE url = $1",
    values: [url]
  }

  return client.query(query)
    .then(readSingleValue("tag"))
}

function insertNewIP(client, ip) {
  const query = {
    name: "insert-ip",
    text: "INSERT INTO ips(ip) VALUES($1) ON CONFLICT DO NOTHING",
    values: [ip]
  }

  return client.query(query)
}

function fetchIpId(client, ip) {
  const query = {
    name: "fetch-ip-id",
    text: "SELECT id FROM ips WHERE ip = $1",
    values: [ip]
  }

  return client.query(query)
    .then(readSingleValue("id"))
}

function lockIpRow(client, id) {
  const query = {
    name: "lock-ip-row",
    text: "SELECT 1 FROM ips WHERE id = $1 FOR UPDATE",
    values: [id]
  }

  return client.query(query)
}

module.exports = {
  insertUrlTransaction
}
