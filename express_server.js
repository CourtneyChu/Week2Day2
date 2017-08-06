const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieSession = require('cookie-session'); // default port 8080
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

var urlDatabase = {
  "b2xVn2": {userID: "user2RandomID", longURL: "http://www.lighthouselabs.ca"},
  "9sm5xK": {userID: "userRandomID", longURL: "http://www.google.com"}
};

//posts to register
app.post("/register", (req, res) => {
  const email = req.body.email;
  for (const user in users) {
    if (users[user].email === email) {
      res.status(400).send("Email is already registered");
    }
  }

  const ID = generateRandomString();
  const password = req.body.password;
  const hashed_password = bcrypt.hashSync(password, 10);
  if (password == "" || email == "" ) {
    res.status(400).send("Must have both fields");
  }
  else {

    users[ID] = {
      id: ID,
      email: email,
      password: hashed_password
    };
    console.log("new user",users[ID]);
    const userId = users[ID].id;
    //res.cookie("user_ID", userId);
    req.session.user_id = userId;
    //const userCookie = req.cookies["user_ID"];
    const userCookie = req.session.user_id
    var templateVars = {owner: userCookie, users: users, urls: urlDatabase}
    console.log(templateVars);
    res.redirect("/urls");
  }

});



//helps us set up the values to the cookie
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("Please enter email and password. You are missing at least one!");
  }
  for (const user in users) {
    if (users[user].email === email) {
      if (bcrypt.compareSync(password, users[user].password)) {
        const userId = users[user].id;
        req.session.user_id = userId;
        res.redirect("/urls")
      } else {
        res.status(400).send("There seems to be a problem with your credentials!");
      }
    }
  }
  res.status(400).send("There seems to be a problem with your credentials!");
});

app.get("/login",  (req, res) => {
  res.render("login");
});


app.get("/register", (req, res) => {
  res.render("register");
});

function generateRandomString() {
    var shortURL = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < 6; i++) {
        shortURL += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return shortURL;
}

// refer here
app.get("/urls", (req, res) => {
  const userCookie = req.session.user_id
  //const userCookie = req.cookies["user_ID"];
  if (!userCookie) {
    res.redirect("/login");
  }
  else {

    //const userCookie = req.cookies["user_ID"];
    // const userCookie = req.session.user_id

    var urls = findMyURLS(userCookie);
    console.log(urls);
    var templateVars = {owner: userCookie, users: users, urls: urls}

    //let templateVars = {urls: urls, user :users[userCookie]};
    res.render("urls_index", templateVars);
  }
});

function findMyURLS(ID) {
  const myUrls = {};
  for(var z in urlDatabase) {
    if(urlDatabase[z].userID === ID) {
      myUrls[z] = urlDatabase[z];
    }
  }
  return myUrls;
};


app.post("/urls", (req, res) => {
 var newURL = req.body.longURL;
 console.log(newURL);
 var userId = req.session.user_id;
 var ID = userId
 var shortURL = generateRandomString();
  urlDatabase[shortURL] = { "userID": ID, "longURL": newURL};
  res.redirect(`/urls/${shortURL}`);
});

//this should delete entries
app.post("/urls/:id/delete", (req, res) => {
  const userCookie = req.session.user_id
   if (userCookie === urlDatabase[req.params.id].userID) {
delete urlDatabase[req.params.id];
res.redirect('/urls/');
 } else {
  res.status(400).send("this is not your URL");
 }
});


//This should let the user edit the URL and then direct them to the urls directory page
// what comes in after the req.params and urls/: could have been anything. Represents id or short url in this case
app.get("/u/:id", (req, res) => {
var longURL = urlDatabase[req.params.id];
res.redirect(longURL);
});

//edits urls
app.post("/urls/:id", (req, res) => {
const userCookie = req.session.user_id
 if (userCookie === urlDatabase[req.params.id].userID) {
 urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls/');
 } else {
  res.status(400).send("this is not your URL");
 }
});

app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

//handles new urls
app.get("/urls/new", (req, res) => {
 const userCookie = req.session.user_id;
  let templateVars = {owner: userCookie, users: users, urls: urlDatabase}

  if (userCookie) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get("/", (req, res) => {
res.redirect("/urls");
});



//just rendering the page
app.get("/urls/:id", (req, res) => {
const userCookie = req.session.user_id
  let templateVars =  { 'users': users, "owner": userCookie, 'urls': urlDatabase, 'shortURL': req.params.id};
  //{ shortURL: req.params.id, longURL: urlDatabase[req.params.id], user:users[userCookie]};
  res.render("urls_show", templateVars);
});

 //urlDatabase[shortURL] = { "owner": ID, "longURL": newURL};
//this url is now an object of objects



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});