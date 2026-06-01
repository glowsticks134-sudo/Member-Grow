const OWNER_ID = '1411750730380869828';

function isOwner(userId) {
  return userId === OWNER_ID;
}

module.exports = { OWNER_ID, isOwner };
