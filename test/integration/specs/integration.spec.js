const supertest = require('supertest')

describe('Notes API', () => {
  let request

  beforeEach(() => {
    request = supertest(process.env.NOTES_BASE_URL)
  })

  describe('addNoteForMember', () => {
    let actual, idRegEx

    beforeEach(async () => {
      const note = {
        note: 'the-note'
      }

      idRegex = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)

      const response = await request
        .post('/clan-id/membership-id')
        .send(note)
        .expect(201)

      actual = response.body
    })

    it('returns the created note', () => {
      expect(idRegex.test(actual.id)).toBe(true)
      expect(actual.note).toEqual('the-note')
    })
  })

  describe('getNotesForMember', () => {
    let actual

    beforeEach(async () => {
      const response = await request.get('/clan-id/membership-id').expect(200)
      actual = response.body
    })

    it('returns the members notes', () => {
      expect(actual.length).toEqual(1)
      expect(actual[0].note).toEqual('the-note')
    })
  })
})
