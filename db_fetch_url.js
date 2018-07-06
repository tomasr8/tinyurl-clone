const { decodeTag } = require("./tag")
const { readSingleValue } = require("./db")

function fetchUrl(client, tag) {
  const id = decodeTag(tag)

  const query = {
    name: "fetch-url",
    text: "SELECT full_url FROM urls WHERE id = $1",
    values: [id]
  }

  return client.query(query)
    .then(readSingleValue("full_url"))
}

module.exports = {
  fetchUrl
}