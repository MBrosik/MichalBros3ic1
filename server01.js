// --------------------------------------------
// zmienne, stałe
// --------------------------------------------

const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
// const formidable = require('formidable');

const PORT = process.env.PORT || 3000;

let users = [
      { id: 1, log: "AAA", pass: "PASS1", wiek: 10, uczen: "checked", plec: "m" },
      { id: 2, log: "BBB", pass: "PASS1", wiek: 10, uczen: "checked", plec: "k" },
      { id: 3, log: "CCC", pass: "CCC", wiek: 16, uczen: "", plec: "m" },
      { id: 4, log: "DDD", pass: "CCC", wiek: 14, uczen: "", plec: "k" }
];
let id = users.length + 1;
let login = false;

// --------------------------------------------
// Wysyłanie/odbieranie informacji ze strony
// --------------------------------------------

app.use(express.static("static"))
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
      res.sendFile(path.join(__dirname + "/static/pages/main.html"))
})

// rejestracja

app.get("/register", function (req, res) {
      res.sendFile(path.join(__dirname + "/static/pages/register.html"))
})

app.post("/register", (req, res) => {
      // console.log("Dzień dobry");
      function loginExist(login) {
            for (let x = 0; x < users.length; x++) {
                  console.log(users[x])
                  if (users[x].log == login) return true;
            }
            return false
      }

      if (loginExist(req.body.login)) {
            // console.log(loginExist(req.body.login));
            res.send(`Dany użytkownik już istnieje.`)
      }
      else {
            users.push({
                  id: id,
                  log: req.body.login,
                  pass: req.body.password,
                  wiek: parseInt(req.body.wiek),
                  uczen: (req.body.uczen == "checked") ? "checked" : "",
                  plec: req.body.plec
            })
            id++;
            res.send(`Login ${req.body.login} został dodany do bazy.`)
      }

      console.log(req.body);
      console.log(users)
})


// login


app.get("/login", function (req, res) {
      res.sendFile(path.join(__dirname + "/static/pages/login.html"))
})

app.post("/login", (req, res) => {
      if (!login) {
            let user = null;
            for (let x = 0; x < users.length; x++) {
                  // console.log(users[x])
                  if (users[x].log == req.body.login) {
                        user = users[x];
                        break;
                  };
            }
            if (user == null) res.send(`Login ${req.body.login} nie istnieje.`)
            else if (user.pass == req.body.password) {
                  login = true;
                  res.redirect('/admin')
            }
            else if (user.pass != req.body.password) res.send(`Hasło do loginu ${req.body.login} nie jest poprawne.`);
      }
      else {
            res.send(`Jesteś już zalogowany`)
      }
})



app.get("/admin", function (req, res) {
      if (!login) {
            res.sendFile(path.join(__dirname + "/static/pages/admin.html"))
      }
      else {
            res.sendFile(path.join(__dirname + "/static/pages/admin-logged.html"))
      }
})

app.get("/sort", (req,res)=>(sorting(req,res)));
app.post("/sort", (req,res)=>(sorting(req,res)));

function sorting(req, res){
      if (login) {
            var sorted = [...users];
            console.log(req.body.sort);
            sorted.sort((a, b) => {
                  return (req.body.sort == "growing") ? (parseFloat(a.wiek) - parseFloat(b.wiek)) : (parseFloat(b.wiek) - parseFloat(a.wiek));
            })

            var string = `\
<!DOCTYPE html>\
<html lang="en">\
<head>\
      <meta charset="UTF-8">\
      <meta name="viewport" content="width=device-width, initial-scale=1.0">\
      <title>Document</title>\
      <link rel="stylesheet" href="../css/main.css">\
</head>\
<body class="blackbody">\
      <div class="topbar">\
            <a href="/sort">sort</a>\
            <a href="/gender">gender</a>\
            <a href="/show">show</a>\
      </div>\
      <form action="/sort" class="changeform" onchange="this.submit()" method="POST">\
            <input type="radio" name="sort" value="growing" ${(req.body.sort == "growing") ? "checked":""}>\
            <label>Rosnąco</label>\
            <input type="radio" name="sort" value="declining" ${(req.body.sort == "growing") ? "":"checked"}>\
            <label>Malejąco</label>\
      </form>`

            string += `<table>`;
            sorted.forEach(el => {
                  string += `\
            <tr>\
                  <td>id: ${el.id}</td>\
                  <td>user: ${el.log} - ${el.pass}</td>\
                  <td>wiek: ${el.wiek}</td>\
            </tr>\
                  `
            })

            string += `</table>`

            string += `</body> </html>`;
            res.send(string);
      }
      else res.redirect('/admin');
}
app.get("/gender", (req, res) => {
      if (login) {
            var tabwomen = [];
            var tabmen = [];

            users.forEach(el => {
                  if (el.plec == "k") tabwomen = [...tabwomen, el];
                  else tabmen = [...tabmen, el];
            })


            var string = `\
<!DOCTYPE html>\
<html lang="en">\
<head>\
      <meta charset="UTF-8">\
      <meta name="viewport" content="width=device-width, initial-scale=1.0">\
      <title>Document</title>\
      <link rel="stylesheet" href="../css/main.css">\
</head>\
<body class="blackbody">\
      <div class="topbar">\
            <a href="/sort">sort</a>\
            <a href="/gender">gender</a>\
            <a href="/show">show</a>\
      </div>`

            string += `<table>`;
            tabwomen.forEach(el => {
                  string += `\
            <tr>\
                  <td>id: ${el.id}</td>\
                  <td>płeć: ${el.plec}</td>\
            </tr>\
                  `
            })
            string += `</table><table>`;
            tabmen.forEach(el => {
                  string += `\
            <tr>\
                  <td>id: ${el.id}</td>\
                  <td>płeć: ${el.plec}</td>\
            </tr>\
                  `
            })
            string += `</table>`


            string += `</body> </html>`

            res.send(string);
      }
      else res.redirect('/admin');

})
app.get("/show", (req, res) => {
      if (login) {


            var string = `\
<!DOCTYPE html>\
<html lang="en">\
<head>\
      <meta charset="UTF-8">\
      <meta name="viewport" content="width=device-width, initial-scale=1.0">\
      <title>Document</title>\
      <link rel="stylesheet" href="../css/main.css">\
</head>\
<body class="blackbody">\
      <div class="topbar">\
            <a href="/sort">sort</a>\
            <a href="/gender">gender</a>\
            <a href="/show">show</a>\
      </div>`

            string += `<table>`;

            users.forEach(el => {
                  string += `\
            <tr>\
                  <td>id: ${el.id}</td>\
                  <td>user: ${el.log} - ${el.pass}</td>\
                  <td>uczeń: <input type="checkbox" name="uczen" ${el.uczen} disabled> </td>\
                  <td>wiek: ${el.wiek}</td>\
                  <td>płeć: ${el.plec}</td>\
            </tr>\
                  `
            })

            string += `</table>`;

            string += `</body> </html>`

            res.send(string);
      }

      else res.redirect('/admin');
})

app.get("/logout", (req, res) => {
      login = false;
      res.redirect('/admin')
})



// --------------------------------------------
// nasłuch na określonym porcie
// --------------------------------------------

app.listen(PORT, function () {
      console.log("start serwera na porcie " + PORT)
})