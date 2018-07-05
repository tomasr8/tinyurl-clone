const rand = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const randIP = () =>
  `${rand(0, 255)}.${rand(0, 255)}.${rand(0, 255)}.${rand(0, 255)}`

const createRow = () =>
  `('${randIP()}')`

const output = `\\c tinyurl
  INSERT INTO ips(ip) VALUES
  `
const values = Array.from({ length: 100 }).map(() => createRow())

const data = output + values.join(",\n") + ";"
const fs = require("fs")

fs.writeFileSync("./test_data_01.sql", data, { encoding: "utf8" })
