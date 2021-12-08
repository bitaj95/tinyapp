const express = require("express");
const app = express();
const PORT = 8080; 
app.set("view engine", "ejs");
const cookieParser = require('cookie-parser')
app.use(cookieParser())


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
  }
}

function generateRandomString() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomString = "";
  for (let i = 0; i < 6; i++) {
    randomString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return randomString;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//Home Page
app.get("/", (req, res) => {
  res.send("Hello!");
});

///urls.json will show a JSON string representing the entire urlDatabase object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
}); 

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//GET request handler for "/urls" page, which displays my URLS 
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

//GET route to present new URL form to user
app.get("/urls/new", (req, res) => {
  let templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

//Generates new shortURL, adds to database.
app.post("/urls", (req, res) => {
  console.log(req.body);
  let urlShort = generateRandomString();
  let urlLong = req.body.longURL;
  urlDatabase[urlShort] = [urlLong]; 
  res.redirect(`/urls/${urlShort}`)
});

//Browser makes a GET request to /urls/:shortURL, renders urls_show template
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

//POST route that updates a URL resource
app.post("/urls/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/longURL");
});

//GET ogin form; redirects to /urls
app.post("/login", (req, res) => {
  res.redirect("/urls");
});

//GET for /register endpoint
app.get("/register", (req, res) => {
  const templateVars = {user: users[req.cookies["user_id"]]};
  res.render("urls_registration", templateVars);
});

//Log Out & Clear Cookies
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Registration Handler
app.post("/register", (req, res) => {
  const newEmail = req.body.email;
  const newPassword = req.body.password;
  const newID = generateRandomString();
  
  users[newID] = {
    id: newID, 
    email: newEmail,
    password: newPassword
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


