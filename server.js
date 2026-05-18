const express = require("express");
const nunjucks = require("nunjucks");

const { createServer } = require("http");
const { Server } = require("socket.io");

//initialize
let app = express();

const httpServer = createServer(app);
const io = new Server(httpServer);

// active duck users
let activeDucks = {};

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
  res.render("chat.njk", { title: "NOVA", numClient: io.engine.clientsCount });
});

//to test if user has connected to the website
io.on("connection", (socket) => {
  console.log("a new user has conneccted!");

  // update user count
  io.emit("total clients", io.engine.clientsCount);

  // ADDED DUCK ELEMENT:
  // preset stair levels so ducks properly sit on different stair heights
  let stairLevels = [
    { z: -0.55, y: -0.62 },
    { z: -0.25, y: -0.72 },
    { z: 0.05, y: -0.82 },
    { z: 0.35, y: -0.92 },
  ];

  // randomly choose one stair level
  let randomStair = stairLevels[Math.floor(Math.random() * stairLevels.length)];

  //make duckie for userrr
  activeDucks[socket.id] = {
    id: socket.id,

    // wider horizontal spread
    x: Math.random() * 3 - 1.5,

    // matching stair depth + stair height
    z: randomStair.z,
    y: randomStair.y,

    // random duck direction
    rotation: Math.random() * Math.PI * 2,
  };
  // send duckies list to everyone
  io.emit("active ducks", activeDucks);

  socket.on("user wish", (dataFromClient) => {
    // send the data back to the client
    io.emit("server sent data", dataFromClient);
  });

  //to test if user has disconnected from the website
  socket.on("disconnect", () => {
    console.log("user disconnected");

    // remove this user's duck
    delete activeDucks[socket.id];

    // send updated duck list to everyone
    io.emit("active ducks", activeDucks);

    // update user count
    io.emit("total clients", io.engine.clientsCount);
  });
});

httpServer.listen(4000, () => {
  console.log("Server running on http://localhost:4000");
});
