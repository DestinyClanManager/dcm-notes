const { when, matchers, verify } = td
const { anything } = matchers

describe('note-repository', () => {
  let subject, databaseProvider, db

  beforeEach(() => {
    db = {
      get: td.function(),
      put: td.function()
    }
    databaseProvider = td.replace('../../../../src/providers/database-provider')

    when(databaseProvider.getInstance()).thenReturn(db)

    subject = require('../../../../src/repositories/note-repository')
  })

  describe('findByClanIdAndMembershipId', () => {
    let actual, promise

    describe('when there are notes for the clan', () => {
      beforeEach(async () => {
        promise = { promise: td.func() }
        let result = {
          Item: {
            notes: {
              'membership-id': 'the-members-notes'
            }
          }
        }
        when(promise.promise()).thenResolve(result)
        when(db.get(anything())).thenReturn(promise)

        actual = await subject.findByClanIdAndMembershipId('clan-id', 'membership-id')
      })

      it('builds the correct query', () => {
        const expectedQuery = {
          TableName: 'dcm-notes',
          Key: { id: 'clan-id' }
        }
        verify(db.get(expectedQuery))
      })

      it('queries the database and returns the result', () => {
        expect(actual).toEqual('the-members-notes')
      })
    })

    describe('when there are no notes for the clan', () => {
      beforeEach(async () => {
        promise = { promise: td.func() }
        let result = {
          Item: undefined
        }
        when(promise.promise()).thenResolve(result)
        when(db.get(anything())).thenReturn(promise)

        actual = await subject.findByClanIdAndMembershipId('clan-id', 'membership-id')
      })

      it('returns an empty array', () => {
        expect(actual).toEqual([])
      })
    })

    describe('when there is a database error', () => {
      beforeEach(async () => {
        const error = new Error('the database error')
        promise = { promise: td.func() }
        when(promise.promise()).thenReject(error)
        when(db.get(anything())).thenReturn(promise)

        try {
          await subject.findByClanIdAndMembershipId('clan-id', 'membership-id')
        } catch (error) {
          actual = error
        }
      })

      it('throw the error', () => {
        expect(actual.message).toEqual('the database error')
      })
    })
  })

  describe('save', () => {
    let actual, promise

    describe('when the note is the first note for the clan', () => {
      beforeEach(async () => {
        promise = { promise: td.func() }

        const result = {
          Item: undefined
        }
        when(promise.promise()).thenResolve(result)
        when(db.get(anything())).thenReturn(promise)
        when(db.put(anything())).thenReturn(promise)

        let note = {
          adminMembershipId: 'admin',
          adminMembershipType: 'bungienet',
          date: 'the-date',
          note: 'the note'
        }
        actual = await subject.save('clan-id', 'membership-id', note)
      })

      it('generates an id for the note and returns it', () => {
        const idRegex = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)
        expect(idRegex.test(actual.id)).toBe(true)
        expect(actual.adminMembershipId).toEqual('admin')
        expect(actual.adminMembershipType).toEqual('bungienet')
        expect(actual.date).toEqual('the-date')
        expect(actual.note).toEqual('the note')
      })

      it('saves the note to the database', () => {
        const expectedQuery = {
          TableName: 'dcm-notes',
          Item: {
            id: 'clan-id',
            notes: {
              'membership-id': [actual]
            }
          }
        }
        verify(db.put(expectedQuery))
      })
    })

    describe('when the clan has notes for other members', () => {
      beforeEach(async () => {
        promise = { promise: td.func() }

        const result = {
          Item: {
            notes: {
              'other-member': 'other-member-notes'
            }
          }
        }

        td.when(promise.promise()).thenResolve(result)
        td.when(db.get(td.matchers.anything())).thenReturn(promise)
        td.when(db.put(td.matchers.anything())).thenReturn(promise)

        let note = {
          adminMembershipId: 'admin',
          adminMembershipType: 'bungienet',
          date: 'the-date',
          note: 'the note'
        }

        actual = await subject.save('clan-id', 'membership-id', note)
      })

      it('saves the new note without losing the existing notes', () => {
        const expectedQuery = {
          TableName: 'dcm-notes',
          Item: {
            id: 'clan-id',
            notes: {
              'other-member': 'other-member-notes',
              'membership-id': [actual]
            }
          }
        }
        verify(db.put(expectedQuery))
      })
    })

    describe('when the member already has notes', () => {
      beforeEach(async () => {
        promise = {
          promise: td.func()
        }

        const result = {
          Item: {
            notes: {
              'membership-id': ['first-note']
            }
          }
        }

        when(db.get(anything())).thenReturn(promise)
        when(promise.promise()).thenResolve(result)
        when(db.put(anything())).thenReturn(promise)

        const note = {
          note: 'the-note'
        }

        actual = await subject.save('clan-id', 'membership-id', note)
      })

      it('saves the new note with the existing note', () => {
        const expectedQuery = {
          TableName: 'dcm-notes',
          Item: {
            id: 'clan-id',
            notes: {
              'membership-id': ['first-note', actual]
            }
          }
        }
        verify(db.put(expectedQuery))
      })
    })

    describe('when the get query fails', () => {
      beforeEach(async () => {
        promise = {
          promise: td.func()
        }

        const error = new Error('get query failure')
        when(db.get(anything())).thenReturn(promise)
        when(promise.promise()).thenReject(error)

        try {
          await subject.save('clan-id', 'membership-id', 'note')
        } catch (error) {
          actual = error
        }
      })

      it('throws the error', () => {
        expect(actual.message).toEqual('get query failure')
      })
    })

    describe('when the put query fails', () => {
      beforeEach(async () => {
        promise = {
          promise: td.func()
        }

        const putPromise = {
          promise: td.func()
        }

        const error = new Error('put query failure')
        when(db.get(anything())).thenReturn(promise)
        when(promise.promise()).thenResolve({})
        when(db.put(anything())).thenReturn(putPromise)
        when(putPromise.promise()).thenReject(error)

        try {
          await subject.save('clan-id', 'membership-id', 'note')
        } catch (error) {
          actual = error
        }
      })

      it('throws an error', () => {
        expect(actual.message).toEqual('put query failure')
      })
    })
  })
})
