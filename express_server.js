const express = require("express");
const app = express();
const PORT = 8080; 
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
app.set("view engine", "ejs");
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

//DATA
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = 
  {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com",
    password: "purple-monkey"
  },

  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },

  "111111": {
    id: "111111", 
    email: "hi@hi.com", 
    password: "hi"
  }
}

//
//HELPER FUNCTION
//
const getUserByEmail = (email) => {
  const userIDs = Object.keys(users);
  const userKeys = Object.values(users);
  const allEmails = userKeys.map( userInfo => userInfo.email);
  const returnUser = {};

  console.log("all values***", userKeys );
  console.log("all emails", allEmails);
  
    userIDs.forEach( id => {
      if (users[id].email === email) {
        returnUser.email = email;
        returnUser.password = users[id].password;
        returnUser.id = id;
      };
    });
    return returnUser; 
}

function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
}); 

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  if (!templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_new", templateVars);
  }
});

//Generate new shortURL, adds to database.
app.post("/urls", (req, res) => {
  const status = users[req.cookies["user_id"]];

  if (!status) {
    res.status(401).send("Please sign in to add shorten a URL");
  } else {
    console.log(req.body);
    let urlShort = generateRandomString();
    let urlLong = req.body.longURL;
    urlDatabase[urlShort] = [urlLong]; 
    res.redirect(`/urls/${urlShort}`)
  }
  
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

//Removes existing shortened URLs from database
app.post("/urls/:shortURL/delete", (req, res) => {
  shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//Updates a URL resource
app.post("/urls/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_registration", templateVars);
  }
});

//LOGIN
app.get("/login", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  if (templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const emailEntered = req.body.email;
  const passwordEntered = req.body.password;
  const checkDatabase = getUserByEmail(emailEntered);

  if (!checkDatabase.email) {
    res.status(403).send("Email was not found.");
  } else if (checkDatabase.password !== passwordEntered) {
    res.status(403).send("Password was incorrect.");
  } else {
    const userID = checkDatabase.id;
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

//LOG OUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//REGISTER
app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const newID = generateRandomString();

  if (!newEmail || !newPassword) {
    res.status(400).send("Email and/or password cannot be left blank.");
  } else if (getUserByEmail(newEmail).email) {
    res.status(400).send("This email is already registered with an account.");
  } else {
    users[newID] = {
      id: newID, 
      email: newEmail,
      password: newPassword
    };
  };
  res.cookie("user_id", newID);
  res.redirect("/urls");
});

//Redirect any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


