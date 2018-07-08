const createApp = require("./server")
const DB = require("./db/DB")

const db = new DB()
const app = createApp(db)
const server = app.listen(8080, "0.0.0.0")
console.log("server listening..")

process.on("SIGTERM", () => {
  console.log("Received SIGTERM")
  stopServer(server, db)
})

process.on("SIGINT", () => {
  console.log("Received SIGINT")
  stopServer(server, db)
})

function stopServer(server, db) {
  server.close(() => {
    db.end().then(() => process.exit(0))
  })
}