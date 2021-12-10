//Return user object when search by email
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

//Creates "filtered" obj containing only URLs that belong to user
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

//Generate 6 character random string
function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

//Checks to see if tinyURL link is valid or not
const doesTinyURLExist = (tinyURL, database) => {
  const shortURLs = Object.keys(database);
  if (shortURLs.includes(tinyURL)) {
    return true;
  }
  return false;
}

module.exports = {getUserByEmail, urlsForUser, generateRandomString, doesTinyURLExist};