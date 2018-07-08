const { app, stopServer } = require("./server")

const server = app.listen(8080, "0.0.0.0")
console.log("server listening..")

process.on("SIGTERM", () => {
  console.log("Received SIGTERM")
  stopServer(server)
})
