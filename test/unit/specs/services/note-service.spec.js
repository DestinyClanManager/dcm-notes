describe('NoteService', () => {
  let subject, noteRepository

  beforeEach(() => {
    noteRepository = td.replace('../../../../src/repositories/note-repository')
    subject = require('../../../../src/services/note-service')
  })

  describe('getMemberNotes', () => {
    let actual

    beforeEach(async () => {
      let notes = 'member-notes'
      td.when(noteRepository.findByClanIdAndMembershipId('clan-id', 'membership-id')).thenResolve(notes)
      actual = await subject.getMemberNotes('clan-id', 'membership-id')
    })

    it('returns the notes for the given member', () => {
      expect(actual).toEqual('member-notes')
    })
  })

  describe('addMemberNote', () => {
    let actual, note, savedNote

    beforeEach(async () => {
      note = 'the-note'
      savedNote = 'the-saved-note'
      td.when(noteRepository.save('clan-id', 'membership-id', note)).thenReturn(savedNote)

      actual = await subject.addMemberNote('clan-id', 'membership-id', note)
    })

    it('saves the note and returns it', () => {
      expect(actual).toBe(savedNote)
    })
  })
})
