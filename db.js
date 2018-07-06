const LIMIT_INTERVAL = "1 hour"
const LIMIT_MAX = 10

async function tx(db, callback) {
  const client = await db.connect()

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

function readSingleValue(keyName) {
  return ({ rows }) => rows.length ? rows[0][keyName] : null
}

module.exports = {
  tx,
  readSingleValue,
  LIMIT_INTERVAL,
  LIMIT_MAX
}
