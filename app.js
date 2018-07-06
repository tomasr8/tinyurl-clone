// const { URL } = require("url")
const express = require("express")
const { Pool } = require("pg")
const { isHttpUri, isHttpsUri } = require("valid-url")
const base62 = require("./base62")

const db = new Pool()
const { fetchUrl } = require("./db_fetch_url")
const { insertUrlTransaction } = require("./db_insert_url")

const app = express()

app.set("trust proxy", true)

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true })) // to support URL-encoded bodies
app.use(express.json())       // to support JSON-encoded bodies

app.get("/", (req, res) => {
  res.sendFile("./public/index.html", { root: __dirname })
})

app.get("/:tag", (req, res) => {
  const tag = req.params.tag

  fetchUrl(db, tag)
    .then(url => {
      if(url === null) {
        res.status(404).sendFile("./public/404.html", { root: __dirname })
      } else {
        res.redirect(url)
      }
    })
    .catch(err => {
      res.status(500).sendFile("./public/500.html", { root: __dirname })
    })
})

app.post("/shorten", (req, res) => {
  let url = req.body.url

  if(!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "http://" + url
  }

  if(!isValidURL(url)) {
    return res.status(400).json({ "error": "Invalid URL" })
  }

  const ip = req.ip

  insertUrlTransaction(db, url, ip)
    .then(({ shortURL, error }) => {
      if(error) {
        res.status(400).json({ error })
      } else {
        res.status(200).json({ shortURL })
      }
    })
    .catch(err => {
      res.status(500).json({ error: "Something went wrong when contacting the DB" })
    })
})

app.use((req, res) => {
  res.status(404).send("404 Not found")
})

const server = app.listen(8080, "0.0.0.0")

process.on("SIGTERM", () => {
  console.log("Received SIGTERM")
  server.close(() => {
    pool.end().then(() => process.exit(0))
  })
})

function isValidURL(url) {
  return isHttpUri(url) || isHttpsUri(url)
}
























