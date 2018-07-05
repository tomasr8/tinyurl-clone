const { readSingleValue, ID_OFFSET } = require("./db")

function fetchUrl(client, id) {
  const query = {
    name: "fetch-url",
    text: "SELECT full_url FROM urls WHERE id = $1",
    values: [id - ID_OFFSET]
  }

  return client.query(query)
    .then(readSingleValue("full_url"))
}

module.exports = {
  fetchUrl
}