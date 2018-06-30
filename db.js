const base62 = require("./base62")
const ID_OFFSET = 10000
const LIMIT_INTERVAL = "1 hour"
const LIMIT_MAX = 10

module.exports = db => {
  function fetchURL(id) {
    const query = {
      name: "fetch-url",
      text: "SELECT full_url FROM urls WHERE id = $1",
      values: [id - ID_OFFSET]
    }
  
    return db.query(query)
      .then(({ rows }) => {
        if (!rows.length) {
          return null
        }
  
        return rows[0].full_url
      })
  }

  async function tx(callback) {
    const client = await db.connect()
  
    try {
      await client.query("BEGIN")
      const result = await callback(client)
      await client.query("COMMIT")
  
      return result
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }
  }
  
  function insertURLTransaction(url, ip) {
    return tx(async function insertURL(client) {
      let shortURL = await fetchShortURL(client, url)

      if(shortURL !== null) {
        return { shortURL }
      }

      if (!await isBelowPostLimit(client, ip)) {
        return { error: "Post limit exceeded" }
      }

      const primKey = await insertFullURL(client, url, ip)
      shortURL = base62.encode(primKey + ID_OFFSET)
  
      await updateShortURL(client, shortURL, primKey)
  
      return { shortURL }
    })
  }

  function isBelowPostLimit(client, ip) {
    const checkLimit = {
      name: "check-limit",
      "text": `SELECT COUNT(*) as count FROM urls WHERE
                created_by = $1 AND date_created > now() - '${LIMIT_INTERVAL}'::interval;`,
      "values": [ip]
    }

    return client.query(checkLimit)
      .then(({ rows }) => {
        const count = rows[0].count
        
        return count < LIMIT_MAX
      })
  }

  function updateShortURL(client, shortURL, primKey) {
    const update = {
      name: "update-url",
      text: "UPDATE urls SET short_url = $1 WHERE id = $2",
      values: [shortURL, primKey]
    }

    return client.query(update)
  }

  function insertFullURL(client, url, ip) {
    const insert = {
      name: "insert-url",
      text: "INSERT INTO urls(full_url, created_by) VALUES($1, $2) RETURNING id",
      values: [url, ip]
    }

    return client.query(insert)
      .then(({ rows }) => {
        return rows[0].id
      })
  }

  function fetchShortURL(client, url) {
    const query = {
      name: "fetch-url",
      text: "SELECT short_url FROM urls WHERE full_url = $1",
      values: [url]
    }
  
    return client.query(query)
      .then(({ rows }) => {
        if(rows.length === 0) {
          return null
        }

        return rows[0].short_url
      })
  }

  return {
    fetchURL,
    insertURLTransaction
  }
}