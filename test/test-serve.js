const chai = require("chai")
const chaiHttp = require("chai-http")
const { expect } = chai
const { app } = require("../server")

chai.use(chaiHttp)

describe("GET /", function () {
  it("should return index.html", () => {
    chai.request(app)
      .get("/")
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
      })
  })
})

describe("API", function () {
  it("should save url", async () => {
    let tag
    await chai.request(app)
      .post("/shorten")
      .send({ url: "seznam.cz" })
      .end((err, res) => {
        expect(err).to.be.null
        expect(res).to.have.status(200)
        console.log(res)
      })

    // await chai.request(app)
    //   .get("/shorten")
    //   .send({ url: "seznam.cz" })
    //   .end((err, res) => {
    //     expect(err).to.be.null
    //     expect(res).to.have.status(200)
    //     console.log(res)
    //   })
  })


})
