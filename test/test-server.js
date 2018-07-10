const chai = require("chai")
let rq = require("request")
const { expect } = chai
const createApp = require("../server")
const DB = require("../db/DB")

process.env.PGPASSWORD = "Monaco"
process.env.PGUSER = "nodejs"
process.env.PGDATABASE = "tinyurl"
process.env.PGHOST = "localhost"
process.env.PGPORT = "6000"

const request = (...args) => {
  return new Promise((resolve, reject) => {
    rq(...args, (err, res, body) => {
      if(err) {
        return reject(err)
      }
      resolve([res, body])
    }) 
  })
}

let db, app, server

describe("HTTP requests", function() {
  before(() => {
    db = new DB()
    app = createApp(db)
    server = app.listen(8080)
    console.log("app listening")
  })

  after(() => {
    server.close()
    db.close()
  })

  describe("GET /", function () {
    it("should return index.html", async function() {

      const [res, ] = await request("http://localhost:8080/")
      expect(res.statusCode).to.equal(200)
    })
  })

  describe("API", function () {
    it("should save url", async function() {
      let res, body
      [res, body] = await request({ method: "POST", url: "http://localhost:8080/shorten", form: { url: "seznam.cz" }})
      expect(res.statusCode).to.equal(200)
      const { tag } = JSON.parse(body);
      [res, body] = await request({ url: "http://localhost:8080/" + tag, followRedirect: false })
      expect(res.statusCode).to.equal(302)
    })

    it("should enforce post limit", async function() {
      const { postLimit } = require("../config")

      for(let i = 1; i < postLimit; i++) {
        const url = String.fromCharCode(i + 65) + "cz"
        const [res, ] = await request({ method: "POST", url: "http://localhost:8080/shorten", form: { url }})
        expect(res.statusCode).to.equal(200)
      }

      const url = String.fromCharCode(postLimit + 65) + "cz"
      const [res, ] = await request({ method: "POST", url: "http://localhost:8080/shorten", form: { url }})
      expect(res.statusCode).to.equal(400)
    })
  })
})