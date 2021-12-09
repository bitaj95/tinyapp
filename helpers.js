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

module.exports = {getUserByEmail, urlsForUser};