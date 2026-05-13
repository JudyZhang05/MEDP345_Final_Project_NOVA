const express = require("express");
const nunjucks = require("nunjucks");
const { createServer } = require("http");
const { Server } = require("socket.io");

//initialize
let app = express();

const httpServer = createServer(app);
const io = new Server(httpServer);

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

//to test if user has connected to the website
io.on("connnection", (socket) => {
  console.log("a user has connected");

  //to test if user has disconnected from the website
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
