const { decodeTag, encodeId } = require("../tag")
const DBBase = require("./DBBase")
const { postLimit, postInterval } = require("../config")
const Transaction = require("./Transaction")

class DB extends DBBase {
  constructor() {
    super()
  }

  fetchUrl(tag) {
    const id = decodeTag(tag)
  
    const query = {
      name: "fetch-url",
      text: "SELECT url FROM urls WHERE id = $1",
      values: [id]
    }
  
    return this.db.query(query)
      .then(this.readSingleValue("url"))
  }

  insertNewRow(url, ip) {
    const tx = new Transaction(this.db)
    return tx.execute((async function(client) {
  
      let tag = await this.fetchTag(client, url)
      // shortened URL already exists
      if (tag !== null) {
        return { tag }
      }
  
      await this.insertNewIP(client, ip)
      const ipId = await this.fetchIpId(client, ip)
      // lock the current ip to prevent reace conditions
      await this.lockIpRow(client, ipId)
  
      const posts = await this.countPosts(client, ipId)
      if (posts >= postLimit) {
        return { error: "Post limit exceeded" }
      }
  
      // get the row primary key
      const urlId = await this.insertUrl(client, url, ipId)
      // compute short url from primary key
      tag = encodeId(urlId)
  
      await this.setTag(client, tag, urlId)
  
      // this return value is propagated from the tx() function as well
      return { tag, remaining: postLimit - posts - 1 }
    }).bind(this))
  }

  countPosts(client, id) {
    const query = {
      name: "count-posts",
      text: `SELECT COUNT(*) as count FROM urls
              LEFT JOIN ips
              ON urls.created_by = ips.id
              WHERE ips.id = $1 AND date_created > now() - '${postInterval}'::interval;`,
      values: [id]
    }
  
    return client.query(query)
      .then(this.readSingleValue("count"))
  }
  
  setTag(client, url, id) {
    const query = {
      name: "set-tag",
      text: "UPDATE urls SET tag = $1 WHERE id = $2",
      values: [url, id]
    }
  
    return client.query(query)
  }
  
  insertUrl(client, url, id) {
    const query = {
      name: "insert-url",
      text: "INSERT INTO urls(url, created_by) VALUES($1, $2) RETURNING id",
      values: [url, id]
    }
  
    return client.query(query)
      .then(this.readSingleValue("id"))
  }
  
  fetchTag(client, url) {
    const query = {
      name: "fetch-tag",
      text: "SELECT tag FROM urls WHERE url = $1",
      values: [url]
    }
  
    return client.query(query)
      .then(this.readSingleValue("tag"))
  }
  
  insertNewIP(client, ip) {
    const query = {
      name: "insert-ip",
      text: "INSERT INTO ips(ip) VALUES($1) ON CONFLICT DO NOTHING",
      values: [ip]
    }
  
    return client.query(query)
  }
  
  fetchIpId(client, ip) {
    const query = {
      name: "fetch-ip-id",
      text: "SELECT id FROM ips WHERE ip = $1",
      values: [ip]
    }
  
    return client.query(query)
      .then(this.readSingleValue("id"))
  }
  
  lockIpRow(client, id) {
    const query = {
      name: "lock-ip-row",
      text: "SELECT 1 FROM ips WHERE id = $1 FOR UPDATE",
      values: [id]
    }
  
    return client.query(query)
  }
}

module.exports = DB