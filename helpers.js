const getUserByEmail = (email, database) => {

  const userIDs = Object.keys(database);
  const returnUser = {};
  
    userIDs.forEach( id => {
      if (database[id].email === email) {
        returnUser.email = email;
        returnUser.password = database[id].password;
        returnUser.id = id;
      };
    });
    return returnUser; 
}

const urlsForUser = (id, database) => {
  const shortURLs = Object.keys(database);
  const filtered = {}
  shortURLs.forEach( url => {
    if ( database[url].userID === id){
      filtered[url] = database[url];
    };
  });
  return filtered;
}

function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

module.exports = {getUserByEmail, urlsForUser, generateRandomString};