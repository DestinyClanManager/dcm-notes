# dcm-notes

> Notes microservice for Destiny Clan Manager

## Endpoints

### getNotesForMember

`GET /notes/{clanId}/{membershipId}`

Returns all <a href="#note">`Notes`</a> for a given member

### addNoteForMember

`POST /notes/{clanId}/{membershipId}`

Request body: <a href="#note">`Note`</a>

Create a <a href="#note">`Note`</a> for the given member

## Resources

<div id="note">

### `Note`

#### `adminMembershipId`

- Type: `String`
- Description: The membershipId of the admin who created the note

#### `adminMembershipType`

- Type: `String`
- Description: The platform type for that the membershipId is associated with. All notes will be associated with the admin's Bungie.net membershipId

#### `date`

- Type: `Date`
- Description: The date the note was created

#### `id`

- Type: `String`
- Description: A UUID to identify the note

#### `note`

- Type: `String`
- Description: The contents of the note

</div>
