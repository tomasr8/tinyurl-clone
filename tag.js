const base62 = require("./base62")
const OFFSET = 1e5

function encodeId(id) {
  return base62.encode(id + OFFSET)
}

function decodeTag(tag) {
  return base62.decode(tag) - OFFSET
}

module.exports = {
  encodeId,
  decodeTag
}