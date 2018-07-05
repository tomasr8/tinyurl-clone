const base62 = require("./base62")
const { tx, readSingleValue, ID_OFFSET, LIMIT_INTERVAL, LIMIT_MAX } = require("./db")

function createShortUrl(id) {
  return base62.encode(id + ID_OFFSET)
}

function insertUrlTransaction(db, url, ip) {
  return tx(db, async function insertURL(client) {

    let shortUrl = await fetchShortUrl(client, url)
    // shortened URL already exists
    if (shortUrl !== null) {
      return { shortUrl }
    }

    await insertNewIP(client, ip)
    const ipId = await fetchIpId(ip)
    // lock the current ip to prevent reace conditions
    await lockIpRow(ipId)

    if (!await isBelowPostLimit(client, ip)) {
      return { error: "Post limit exceeded" }
    }

    // get the row primary key
    const urlId = await insertFullUrl(client, url, ip)
    // compute short url from primary key
    shortUrl = createShortUrl(urlId)

    await setShortUrl(client, shortUrl, urlId)

    return { shortUrl }
  })
}

function isBelowPostLimit(client, id) {
  const query = {
    name: "is-below-post-limit",
    "text": `SELECT COUNT(*) as count FROM urls
                LEFT JOIN ips
                WHERE ips.id = $1 AND date_created > now() - '${LIMIT_INTERVAL}'::interval;`,
    "values": [id]
  }

  return client.query(query)
    .then(readSingleValue("count"))
    .then(count => count < LIMIT_MAX)
}

function setShortUrl(client, url, id) {
  const query = {
    name: "update-short-url",
    text: "UPDATE urls SET short_url = $1 WHERE id = $2",
    values: [url, id]
  }

  return client.query(query)
}

function insertFullUrl(client, url, id) {
  const query = {
    name: "insert-full-url",
    text: "INSERT INTO urls(full_url, created_by) VALUES($1, $2) RETURNING id",
    values: [url, id]
  }

  return client.query(query)
    .then(readSingleValue("id"))
}

function fetchShortUrl(client, url) {
  const query = {
    name: "fetch-url",
    text: "SELECT short_url FROM urls WHERE full_url = $1",
    values: [url]
  }

  return client.query(query)
    .then(readSingleValue("short_url"))
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
