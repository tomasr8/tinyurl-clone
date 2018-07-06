const { decodeTag } = require("./tag")
const { readSingleValue } = require("./db")

function fetchUrl(client, tag) {
  const id = decodeTag(tag)

  const query = {
    name: "fetch-url",
    text: "SELECT url FROM urls WHERE id = $1",
    values: [id]
  }

  return client.query(query)
    .then(readSingleValue("url"))
}

module.exports = {
  fetchUrl
}