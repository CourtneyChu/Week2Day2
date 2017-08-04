var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var cookieParser = require('cookie-parser'); // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs")

const users = {
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
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  if (password == "" || email == "" ) {
    res.status(400).send("Must have both fields");
  } else {
    users[ID] = { id: ID,
    email: email,
    password: password }
  }
  res.cookie("user_ID", ID);

  res.redirect("/urls");
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
      if (users[user].password === password) {
        const ID = users[user].id;
        res.cookie("user_ID", ID)
        res.redirect("/urls")
      } else {
        res.status(400).send("Your password seems to be incorrect!");
      }
    }
  }
  res.status(400).send("Email not found");
});

app.get("/login",  (req, res) => {
  res.render("login");
});


app.get("/register", (req, res) => {
  res.render("register");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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
  const userCookie = req.cookies["user_ID"];
  let templateVars = { urls: urlDatabase, user: users[userCookie] };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
 var newURL = req.body.longURL;
 var shortURL = generateRandomString();
  urlDatabase[shortURL] = newURL;
  console.log(urlDatabase);  // debug statement to see POST parameters
  res.redirect(`/urls/${shortURL}`);

});

//this should delete entries
app.post("/urls/:id/delete", (req, res) => {
delete urlDatabase[req.params.id];
res.redirect('/urls/');
});


//This should let the user edit the URL and then direct them to the urls directory page
// what comes in after the req.params and urls/: could have been anything. Represents id or short url in this case
app.get("/u/:id", (req, res) => {
var longURL = urlDatabase[req.params.id];
res.redirect(longURL);
});

//edits urls
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect('/urls/');
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_ID");
  res.redirect('/urls');
});

//handles new urls
app.get("/urls/new", (req, res) => {
  const userCookie = req.cookies["user_ID"]
  let templateVars = { user: userCookie}
  res.render("urls_new", templateVars);
});

//just rendering the page
app.get("/urls/:id", (req, res) => {
  const userCookie = req.cookies["user_ID"]
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], user:users[userCookie]};
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});