const { Pool } = require("pg")

class DBBase {
  constructor() {
    this.db = new Pool()
  }

  close() {
    this.db.end()
  }

  readSingleValue(keyName) {
    return ({ rows }) => rows.length ? rows[0][keyName] : null
  }
}

module.exports = DBBase