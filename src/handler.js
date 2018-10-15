const noteService = require('./services/note-service')

function handleError(error, callback) {
  if (process.env.LOGGING_ENABLED === 'true') {
    console.error(error)
  }
  callback(error, {
    statusCode: 500
  })
}

module.exports.getNotesForMember = async (event, context, callback) => {
  const { clanId, membershipId } = event.pathParameters

  let notes
  try {
    notes = await noteService.getMemberNotes(clanId, membershipId)
  } catch (error) {
    handleError(error, callback)
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify(notes)
  }

  callback(null, response)
}

module.exports.addNoteForMember = async (event, context, callback) => {
  const { clanId, membershipId } = event.pathParameters
  const newNote = JSON.parse(event.body)

  let createdNote
  try {
    createdNote = await noteService.addMemberNote(clanId, membershipId, newNote)
  } catch (error) {
    handleError(error, callback)
  }

  const response = {
    statusCode: 201,
    body: JSON.stringify(createdNote)
  }

  callback(null, response)
}
