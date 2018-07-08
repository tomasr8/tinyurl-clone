const { expect } = require("chai")
const tag = require("../tag")

describe("Tag", function() {
  describe("encode() + decode()", function() {
    it("should return the original id for decode(encode(..))", () => {
      Array.from({ length: 100 }).forEach((_, id) => {
        const newId = tag.decodeTag(tag.encodeId(id))
        expect(id).to.eqls(newId)
      })
    })
  })
})
