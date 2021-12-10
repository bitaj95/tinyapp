const { assert } = require("chai");

const { getUserByEmail, urlsForUser } = require("../helpers.js");

const testURLs = {

  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "111111"
  }
};

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe("getUserByEmail", function() {
  it("should return a user with valid email", function() {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
  });
  it("should return password 'dishwasher-funk' as password for user2@example.com", function() {
    const user = getUserByEmail("user2@example.com", testUsers)
    const expectedUserPassword = "dishwasher-funk";
    assert.equal(user.password, expectedUserPassword);
  });
  it("should return object with an unregistered email", function() {
    const user = getUserByEmail("bob@mail.com", testUsers);
    assert.isObject(user);
  });
  it("should return *empty* object with an unregistered email", function() {
    const user = getUserByEmail("bob@mail.com", testUsers);
    assert.isEmpty(user);
  });
});
describe("urlsForUser", function() {
  it("should return object with an unregistered id", function() {
    const url = urlsForUser("555555", testURLs)
    assert.isObject(url);
  });
  it("should return *empty* object with an unregistered id", function() {
    const url = urlsForUser("555555", testURLs)
    assert.isEmpty(url);
  });
});