const { encodeId } = require("../tag")

const padDate = (date) => date.toString().length === 1 ? "0" + date : date

const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const randWord = (length) =>
  Array.from({ length }).map(() => String.fromCharCode(randInt(65, 90))).join("")
const randURL = (length) => `http://${randWord(length)}.com`
const randForeignKey = () => `${randInt(1, 100)}`
const randISODate = () =>
  `${randInt(1971, 2018)}-${padDate(randInt(1, 12))}-${padDate(randInt(1, 28))} ` +
  `${padDate(randInt(0, 23))}:${padDate(randInt(0, 59))}:${padDate(randInt(1, 59))}`

const createRow = (index) => {
  const url = randURL(8)
  const tag = encodeId(index)
  const date = randISODate()
  const fKey = randForeignKey()

  return `('${url}', '${tag}', '${date}', ${fKey})`
}

const output = `\\c tinyurl
  INSERT INTO urls(url, tag, date_created, created_by) VALUES
  `
const values = Array.from({ length: 100 }).map((_, i) => createRow(i + 1))

const data = output + values.join(",\n") + ";"
const fs = require("fs")

fs.writeFileSync("./test_data_02.sql", data, { encoding: "utf8" })
