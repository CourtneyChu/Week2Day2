const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const cookieSession = require('cookie-session');
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
    const userId = users[ID].id;
    req.session.user_id = userId;
    const userCookie = req.session.user_id
    var templateVars = {owner: userCookie, users: users, urls: urlDatabase}
    res.redirect("/urls");
  }

});


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
  if (req.session.user_id == undefined) {
  res.render("login")
} else {
  res.redirect("/urls");
};
} );


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

app.get("/urls", (req, res) => {
  const userCookie = req.session.user_id
  if (!userCookie) {
    res.redirect("/login");
  }
  else {
    var urls = findMyURLS(userCookie);
    var templateVars = {owner: userCookie, users: users, urls: urls}
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

function checker(longURL) {
  if (longURL.includes('http') || longURL.includes('https')) {
    return longURL
  } else {
const newLongURL = ("http://" + longURL);
  return newLongURL;
  }
}


app.post("/urls", (req, res) => {
 var newURL = checker(req.body.longURL);
 var userId = req.session.user_id;
 var ID = userId
 var shortURL = generateRandomString();
  urlDatabase[shortURL] = { "userID": ID, "longURL": newURL};
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const userCookie = req.session.user_id
   if (userCookie === urlDatabase[req.params.id].userID) {
delete urlDatabase[req.params.id];
res.redirect('/urls/');
 } else {
  res.status(400).send("this is not your URL");
 }
});


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

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    let long = urlDatabase[req.params.id].longURL
    res.redirect(long)
  } else {
    res.status(404).send("This URL does not exist");
  }
  });

app.get("/urls/:id", (req, res) => {
const userCookie = req.session.user_id
  if (userCookie === undefined) {
  res.status(400).send("You are not logged in")
  } else if (!urlDatabase[req.params.id]) {
  res.status(400).send("This is not a short url")
  } else if (userCookie !== urlDatabase[req.params.id].userID) {
    res.status(400).send("This URL does not belong to you");
  }
  let templateVars =  { 'users': users, "owner": userCookie, 'urls': urlDatabase, 'shortURL': req.params.id};
  res.render("urls_show", templateVars);
});




app.listen(PORT, () => {
  console.log(`listening on port ${PORT}!`);
});