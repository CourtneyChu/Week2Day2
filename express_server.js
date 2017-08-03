var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080;
var cookieParser = require('cookie-parser'); // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs")

//cookie-parser - helps us read the values from the cookie

//res.cookie helps us set the values on the cookie

//helps us set up the values to the cookie
app.post("/login", (req, res) => {
let name = req.body.username;
res.cookie('username', name)
res.redirect("/urls")
});





var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};




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


app.get("/urls", (req, res) => {
  let templateVars = {urls: urlDatabase, usernames: req.cookies["username"]};
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
  res.clearCookie("username");
  res.redirect('/urls');
});

//handles new urls
app.get("/urls/new", (req, res) => {
  let templateVars = { usernames: req.cookies["username"]}
  res.render("urls_new", templateVars);
});

//just rendering the page
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id, longURL: urlDatabase[req.params.id], usernames: req.cookies["username"]};
  res.render("urls_show", templateVars);
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});