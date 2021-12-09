const express = require("express");
const app = express();
const PORT = 8080; 
const cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
app.set("view engine", "ejs");
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: true}));

//DATA
const urlDatabase = {

  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "111111"
  }
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

//HELPER FUNCTIONs
const getUserByEmail = (email) => {
  const userIDs = Object.keys(users);
  const userKeys = Object.values(users);
  const returnUser = {};
  
    userIDs.forEach( id => {
      if (users[id].email === email) {
        returnUser.email = email;
        returnUser.password = users[id].password;
        returnUser.id = id;
      };
    });
    return returnUser; 
}
//Returns the URLs where the userID === id of logged-in user.
const urlsForUser = (id) => {
  const shortURLs = Object.keys(urlDatabase);
  const filtered = {}
  shortURLs.forEach( url => {
    if ( urlDatabase[url].userID === id){
      filtered[url] = urlDatabase[url];
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
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

//ADD NEW URL
app.get("/urls/new", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  if (!templateVars.user) {
    res.redirect("/urls");
  } else {
    res.render("urls_new", templateVars);
  }
});

//Generate new shortURL, add to db.
app.post("/urls", (req, res) => {
  console.log(req.body);
  const templateVars = {user: users[req.cookies["user_id"]]};

  if (!templateVars.user) {
    res.status(401).send("Please sign in to add shorten a URL");
  } else {
    const urlShort = generateRandomString();
    const urlLong = req.body.longURL;

    urlDatabase[urlShort] = {
      longURL: urlLong,
      userID: req.cookies["user_id"]
    } 
    res.redirect(`/urls/${urlShort}`)
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies["user_id"]]
  };
  if (!templateVars.user) {
    res.status(401).send("Please sign in to view this page");
  } else if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
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
  } else if (!bcrypt.compareSync( passwordEntered, checkDatabase.password)) {
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

//REGISTRATION
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
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
  } else if (getUserByEmail(newEmail).email) {
    res.status(400).send("This email is already registered with an account.");
  } else {
    users[newID] = {
      id: newID, 
      email: newEmail,
      password: hashedPassword
    };
  };

  console.log("filtered", urlsForUser("111111"));
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


