const express = require("express");
const nunjucks = require("nunjucks");

//initialize
let app = express();

//setup nunjucks
nunjucks.configure("views", {
  autoescape: true,
  express: app,
});
app.set("view engine", "njk");

//middleware
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("chat.njk", { title: "NOVA" });
});

app.get("/about", (req, res) => {
  res.render("about.njk", { title: "About The Project" });
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
