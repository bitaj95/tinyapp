const express = require("express");
const app = express();
const PORT = 8080; 
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const {getUserByEmail, urlsForUser, generateRandomString} = require("./helpers.js");

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: [ "key1", "key2"],
}))

//DATA
const urlDatabase = {};
const users = {}

app.get("/", (req, res) => {
  const templateVars = {user: users[req.session.user_id]};
  if (!templateVars.user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
}); 

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
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
  console.log(req.body);
  const templateVars = {user: users[req.session.user_id]};

  if (!templateVars.user) {
    res.status(401).send("Please sign in to shorten a URL");
  } else {
    const urlShort = generateRandomString();
    const urlLong = req.body.longURL;

    urlDatabase[urlShort] = {
      longURL: urlLong,
      userID: req.session.user_id
    } 
    res.redirect(`/urls/${urlShort}`)
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id]
  };
  if (!templateVars.user) {
    res.status(401).send("Please sign in to view this page");
  } else if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    res.render("urls_show", templateVars);
  } else {
    res.status(401).send("Sorry, this is not your URL to edit.");
  }
});

//Removes existing shortened URLs from db
app.post("/urls/:shortURL/delete", (req, res) => {
  shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
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
    res.status(403).send("Email was not found.");
  } else if (!bcrypt.compareSync( passwordEntered, checkDatabase.password)) {
    res.status(403).send("Password was incorrect.");
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
    res.status(400).send("Email and/or password cannot be left blank.");
  } else if (getUserByEmail(newEmail, users).email) {
    res.status(400).send("This email is already registered with an account.");
  } else {
    users[newID] = {
      id: newID, 
      email: newEmail,
      password: hashedPassword
    };
  };
  req.session["user_id"] = newID;
  res.redirect("/urls");
});

//Redirect any request to "/u/:shortURL" to original URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(`http://${longURL}`)
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


