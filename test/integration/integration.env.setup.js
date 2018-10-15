require('dotenv').config({ path: './test/integration/.integration.env' })

const AWS = require('aws-sdk')
AWS.config.update({ region: 'us-east-1' })

const databaseProvider = require('../../src/providers/database-provider')
const db = databaseProvider.getInstance()
const query = {
  TableName: 'dcm_notes_test',
  Item: {
    id: 'clan-id',
    notes: {}
  }
}

db.put(query)
  .promise()
  .then(() => {
    console.log('test environment restored')
  })
