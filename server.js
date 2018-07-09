const express = require("express")
const { isHttpUri, isHttpsUri } = require("valid-url")
const { postLimit } = require("./config")


function createApp(db) {
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

    db.fetchUrl(tag)
      .then(url => {
        if(url === null) {
          res.status(404).sendFile("./public/404.html", { root: __dirname })
        } else {
          res.redirect(url)
        }
      })
      .catch(err => {
        console.error(err)
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
    db.insertNewRow(url, ip)
      .then(({ error, tag, remaining }) => {
        if(error) {
          res.status(400).json({ error })
        } else {
          if(remaining !== undefined) { // url was added
            res.header("X-RateLimit-Limit", postLimit)
            res.header("X-RateLimit-Remaining", remaining) 
          }
          res.status(200).json({ tag })
        }
      })
      .catch(err => {
        console.log("transaction error", err)
        res.status(500).json({ error: "Something went wrong when contacting the DB" })
      })
  })
  
  app.use((req, res) => {
    res.status(404).send("404 Not found")
  })

  return app
}

function isValidURL(url) {
  return isHttpUri(url) || isHttpsUri(url)
}

module.exports = createApp





















