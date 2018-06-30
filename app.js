// const { URL } = require("url")
const express = require("express")
const { Pool } = require("pg")
const { isHttpUri, isHttpsUri } = require("valid-url")
const base62 = require("./base62")

const pool = new Pool()
const dbUtils = require("./db")(pool)

const app = express()

app.set("trust proxy", true)

app.use(express.static("public"))
app.use(express.urlencoded({ extended: true })) // to support URL-encoded bodies
app.use(express.json())       // to support JSON-encoded bodies

app.get("/", (req, res) => {
  res.sendFile("./public/index.html", { root: __dirname })
})

app.get("/:short", (req, res) => {
  const short = req.params.short
  const id = base62.decode(short)

  dbUtils.fetchURL(id)
    .then(url => {
      if(url === null) {
        res.status(404).sendFile("./public/404.html", { root: __dirname })
      } else {
        res.redirect(url)
      }
    })
    .catch(err => {
      res.status(500).sendFile("./public/500.html", { root: __dirname })
      console.error(err)
    })
})

app.post("/shorten", (req, res) => {
  let url = req.body.url

  console.log(url)

  if(!isValidURL(url)) {
    return res.status(400).json({ "error": "Invalid URL" })
  }

  console.log(url)
  const ip = req.ip
  console.log(ip)

  dbUtils.insertURLTransaction(url, ip)
    .then(({ shortURL, error }) => {
      if(error) {
        res.status(400).json({ error })
      } else {
        res.status(200).json({ shortURL })
      }
    })
    .catch(err => {
      res.status(500).json({ error: "Something went wrong when contacting the DB" })
      console.error(err)
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
  if(!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "http://" + url
  }

  return isHttpUri(url) || isHttpsUri(url)
}























