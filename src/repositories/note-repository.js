const databaseProvider = require('../providers/database-provider')
const uuid = require('uuid/v4')

module.exports.findByClanIdAndMembershipId = async function(clanId, membershipId) {
  const db = databaseProvider.getInstance()

  const query = {
    TableName: process.env.NOTES_TABLE,
    Key: { id: clanId }
  }

  let result
  try {
    result = await db.get(query).promise()
  } catch (error) {
    throw error
  }

  if (!result.Item) {
    return []
  }

  return result.Item.notes[membershipId]
}

module.exports.save = async function(clanId, membershipId, note) {
  const db = databaseProvider.getInstance()

  note.id = uuid()

  const getClanNotesQuery = {
    TableName: process.env.NOTES_TABLE,
    Key: { id: clanId }
  }

  const result = await db.get(getClanNotesQuery).promise()

  const saveClanNotesQuery = {
    TableName: process.env.NOTES_TABLE,
    Item: { id: clanId }
  }

  if (!result.Item) {
    const clanNotes = {}
    clanNotes[membershipId] = [note]
    saveClanNotesQuery.Item.notes = clanNotes
    result.Item = {
      id: clanId,
      notes: {}
    }
  }

  if (!result.Item.notes[membershipId]) {
    result.Item.notes[membershipId] = []
  }

  result.Item.notes[membershipId].push(note)

  saveClanNotesQuery.Item.notes = result.Item.notes

  await db.put(saveClanNotesQuery).promise()

  return note
}
