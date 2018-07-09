class Transaction {
  constructor(db) {
    this.db = db
  }

  async execute(callback) {
    const client = await this.db.connect()
  
    try {
      await client.query("BEGIN")
      const result = await callback(client)
      await client.query("COMMIT")
  
      return result
    } catch (err) {
      await client.query("ROLLBACK")
      throw err
    } finally {
      client.release()
    }
  }
}

module.exports = Transaction