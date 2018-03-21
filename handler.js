const AWS = require('aws-sdk')
const dynamoDB = new AWS.DynamoDB.DocumentClient()
const uuid = require('uuid/v4')

function handleError(error, callback) {
  callback(error, {
    statusCode: 500
  })
}

module.exports.getNotesForMember = (event, context, callback) => {
  const clanId = event.pathParameters.clanId
  const membershipId = event.pathParameters.membershipId

  const query = {
    TableName: process.env.NOTES_TABLE,
    Key: { id: clanId }
  }

  dynamoDB.get(query, (error, result) => {
    if (error) {
      handleError(error, callback)
    }

    const response = {
      statusCode: 200
    }

    if (!result.Item) {
      response.body = '[]'
    } else {
      response.body = JSON.stringify(result.Item.notes[membershipId])
    }

    callback(null, response)
  })
}

module.exports.addNoteForMember = (event, context, callback) => {
  const clanId = event.pathParameters.clanId
  const membershipId = event.pathParameters.membershipId
  const newNote = JSON.parse(event.body)

  console.log('saving note for member', membershipId, newNote)

  newNote.id = uuid()

  const query = {
    TableName: process.env.NOTES_TABLE,
    Key: { id: clanId }
  }

  dynamoDB.get(query, (error, result) => {
    if (error) {
      handleError(error, callback)
    }

    console.log('fetched notes for clan', clanId)

    if (!result.Item) {
      console.log('no notes for clan', clanId, 'creating profile...')
      const initialNotes = {}
      initialNotes[membershipId] = [newNote]
      const clanNotesProfileQuery = {
        TableName: process.env.NOTES_TABLE,
        Item: {
          id: clanId,
          notes: initialNotes
        }
      }

      dynamoDB.put(clanNotesProfileQuery, error => {
        if (error) {
          handleError(error, callback)
        }

        const response = {
          statusCode: 201,
          body: JSON.stringify(newNote)
        }

        console.log('sending response', response)

        callback(null, response)
      })
      return
    }

    const notes = result.Item.notes

    if (!notes[membershipId]) {
      console.log('no notes for member', membershipId, 'creating history now...')
      notes[membershipId] = [newNote]
      const createNoteHistoryForMemberQuery = {
        TableName: process.env.NOTES_TABLE,
        Item: {
          id: clanId,
          notes
        }
      }

      dynamoDB.put(createNoteHistoryForMemberQuery, error => {
        if (error) {
          handlerError(error, callback)
        }

        const response = {
          statusCode: 201,
          body: JSON.stringify(newNote)
        }

        console.log('sending response', response)

        callback(null, response)
      })
      return
    }

    notes[membershipId].push(newNote)

    const updateClanNoteQuery = {
      TableName: process.env.NOTES_TABLE,
      Item: {
        id: clanId,
        notes
      }
    }

    console.log('updated notes for member', membershipId)

    dynamoDB.put(updateClanNoteQuery, error => {
      if (error) {
        handleError(error, callback)
      }

      const response = {
        statusCode: 201,
        body: JSON.stringify(newNote)
      }

      console.log('sending response', response)

      callback(null, response)
    })
  })
}
