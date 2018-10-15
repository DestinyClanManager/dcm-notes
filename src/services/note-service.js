const notesRepository = require('../repositories/note-repository')

module.exports.getMemberNotes = async function(clanId, membershipId) {
  return await notesRepository.findByClanIdAndMembershipId(clanId, membershipId)
}

module.exports.addMemberNote = async function(clanId, membershipId, note) {
  return await notesRepository.save(clanId, membershipId, note)
}
