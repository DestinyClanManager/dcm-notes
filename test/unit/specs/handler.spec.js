describe('handler', () => {
  let subject, noteService

  beforeEach(() => {
    noteService = td.replace('../../../src/services/note-service')
    subject = require('../../../src/handler')
  })

  describe('getNotesForMember', () => {
    let callback

    beforeEach(() => {
      callback = td.func()
    })

    describe('when everything goes well', () => {
      beforeEach(() => {
        const event = {
          pathParameters: {
            clanId: 'clan-id',
            membershipId: 'membership-id'
          }
        }

        td.when(noteService.getMemberNotes('clan-id', 'membership-id')).thenResolve(['member notes'])

        subject.getNotesForMember(event, null, callback)
      })

      it('respnds with the members notes', () => {
        const expectedResponse = {
          statusCode: 200,
          body: JSON.stringify(['member notes'])
        }
        td.verify(callback(null, expectedResponse))
      })
    })

    describe('when there is an error', () => {
      let error

      beforeEach(() => {
        const event = {
          pathParameters: {
            clanId: 'clan-id',
            membershipId: 'membership-id'
          }
        }

        error = new Error('the error')
        td.when(noteService.getMemberNotes('clan-id', 'membership-id')).thenReject(error)

        subject.getNotesForMember(event, null, callback)
      })

      it('returns an error response', () => {
        td.verify(callback(error, { statusCode: 500 }))
      })
    })
  })

  describe('addNoteForMember', () => {
    let callback

    beforeEach(() => {
      callback = td.func()
    })

    describe('when everything goes well', () => {
      beforeEach(() => {
        const note = {
          note: 'the-note'
        }

        const event = {
          pathParameters: {
            clanId: 'clan-id',
            membershipId: 'membership-id'
          },
          body: JSON.stringify(note)
        }

        td.when(noteService.addMemberNote('clan-id', 'membership-id', note)).thenReturn({ note: 'the-note' })

        subject.addNoteForMember(event, null, callback)
      })

      it('responds with the created note', () => {
        const expectedResponse = {
          statusCode: 201,
          body: JSON.stringify({ note: 'the-note' })
        }
        td.verify(callback(null, expectedResponse))
      })
    })

    describe('when there is an error', () => {
      let error

      beforeEach(() => {
        const note = {}
        const event = {
          pathParameters: {
            clanId: 'clan-id',
            membershipId: 'membership-id'
          },
          body: JSON.stringify(note)
        }

        error = new Error('the error')
        td.when(noteService.addMemberNote('clan-id', 'membership-id', note)).thenReject(error)

        subject.addNoteForMember(event, null, callback)
      })

      it('responds with an error', () => {
        td.verify(callback(error, { statusCode: 500 }))
      })
    })
  })
})
