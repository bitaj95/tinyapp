const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const {getUserByEmail, urlsForUser, generateRandomString, doesTinyURLExist} = require("./helpers.js");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: [ "key1", "key2"],
}));

//DATA
const urlDatabase = {};
const users = {};

app.get("/", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  if (!templateVars.user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

//ADD NEW URL
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  if (!templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_new", templateVars);
  }
});

//Generate new shortURL, add to db.
app.post("/urls", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  if (!templateVars.user) {
   
    res.status(401).send("<html><body>Please sign in to shorten a URL</body></html>\n");
  } else {
    const urlShort = generateRandomString();
    const urlLong = req.body.longURL;
    urlDatabase[urlShort] = {
      longURL: urlLong,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${urlShort}`);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const doesURLExist = doesTinyURLExist(shortURL, urlDatabase);
  const yourURLs = urlsForUser(req.session.user_id, urlDatabase);
  
  let templateVars = {};

  //templateVars key/values will depend on whether the tinyURL exists.
  if (doesURLExist) {
    templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      user: users[req.session.user_id],
      doesURLExist,
      correctUser: true
    };
  //if tinyURL not valid
  } else {
    templateVars = {
      doesURLExist,
      user: users[req.session.user_id]
    };
  }

  if (!doesTinyURLExist(shortURL, urlDatabase)) {
    res.render("urls_show", templateVars);
    //if tinyURL not valid, show html page informing user.
  } else if (!templateVars.user) {
    res.status(401);
    res.render("urls_show", templateVars);
    //else if user not logged in, show html page informing user.
  } else if (req.session.user_id === urlDatabase[shortURL].userID) {
    res.status(401);
    res.render("urls_show", templateVars);
    //else if user is signed in, show html page that that lets them edit the tiny link.
  } else if (!Object.keys(yourURLs).includes(shortURL)) {
    templateVars.correctUser = false;
    res.status(401);
    res.render("urls_show", templateVars);
    //the tiny code does not belong to user, show html page informing them they cannot edit.
  } 
});

//Removes existing short URLs from db
app.post("/urls/:shortURL/delete", (req, res) => {
  //if user is not logged in, display error message.
  const yourURLs = urlsForUser(req.session.user_id, urlDatabase);
  const shortURL = req.params.shortURL;

  if (!users[req.session.user_id]) {
    res.status(401).send("<html><body>Please sign in to perform this action.</body></html>\n");
  } else if (!Object.keys(yourURLs).includes(shortURL)) {
    res.status(400).send("<html><body>Sorry, this is not your URL to edit. </body></html>\n");
  } else {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

//Updates URL resource
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

//LOGIN
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const emailEntered = req.body.email;
  const passwordEntered = req.body.password;
  const checkDatabase = getUserByEmail(emailEntered, users);

  if (!checkDatabase.email) {
    res.status(403).send("<html><body> Email not found. </body></html>\n");
  } else if (!bcrypt.compareSync(passwordEntered, checkDatabase.password)) {
    res.status(403).send("<html><body> Password was incorrect. </body></html>\n");
  } else {
    const userID = checkDatabase.id;
    req.session["user_id"] = userID;
    res.redirect("/urls");
  }
});

//LOG OUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//REGISTRATION
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_registration", templateVars);
  }
});

app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const newID = generateRandomString();

  if (!newEmail || !newPassword) {
    res.status(400).send("<html><body> Email and/or password cannot be left blank. </body></html>\n");
  } else if (getUserByEmail(newEmail, users).email) {
    res.status(400).send("<html><body> This email is already registered with an account. </body></html>\n");
  } else {
    users[newID] = {
      id: newID,
      email: newEmail,
      password: hashedPassword
    };
  }
  req.session["user_id"] = newID;
  res.redirect("/urls");
});

//Redirect any request to "/u/:shortURL" to original URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;

  if(!urlDatabase[req.params.shortURL]) {
    res.status(404).send("<html><body> Sorry, the tiny URL entered was not valid. </body></html>\n")
  } else if (longURL.includes("http")) {
    res.redirect(longURL);
  } else {
    res.redirect(`http://${longURL}`);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


