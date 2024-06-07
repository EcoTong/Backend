const { response } = require("express");
const express = require("express");
const questRouter = express.Router();
const { Op } = require("sequelize");
const db = require("../models");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_SECRET;
questRouter.get("/", async (req, res) => {
  try {
    const quests = await db.Quest.findAll();
    res.status(200).json({
      status: "success",
      data: quests,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
//make me a function as a middleware to validate the jwt token
async function validateToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (
    typeof bearerHeader !== "undefined" ||
    bearerHeader !== null ||
    bearerHeader !== ""
  ) {
    const bearerToken = bearerHeader;
    console.log("ini token " + bearerToken);
    let userdata;
    try {
      userdata = jwt.verify(bearerToken, JWT_KEY);
    } catch (error) {
      return res.status(403).json({
        status: "error",
        message:
          "Forbidden, you are not authorized to access this page (token invalid)",
      });
    }
    console.log("ini userdata" + userdata);
    const user = await db.User.findOne({
      where: { username: userdata.username },
    });
    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found, token invalid",
      });
      return;
    } else {
      req.user = user;
    }
    next();
  } else {
    res.status(403).json({
      status: "error",
      message:
        "Forbidden, you are not authorized to access this page (no token provided)",
    });
  }
}

//bikin api buat post quest
questRouter.post("/tambahquest", validateToken, async (req, res) => {
  try {
    let { prize, description, category, picture } = req.body;
    let username = req.user.username;
    let id = "QUEST_" + username + "_" + formatDate(new Date());
    const newQuest = await db.Quest.create({
      id,
      username,
      prize,
      description,
      category,
      picture,
      status: false,
    });
    res.status(201).json({
      status: "success",
      data: newQuest,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
function formatDate(date) {
  // Get the year, month, day, hours, minutes, and seconds
  let year = date.getFullYear();
  let month = padZero(date.getMonth() + 1); // Month is zero-based, so add 1
  let day = padZero(date.getDate());
  let hours = padZero(date.getHours());
  let minutes = padZero(date.getMinutes());
  let seconds = padZero(date.getSeconds());

  // Format the date as "YYYY-MM-DD HH:mm:ss"
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Function to pad single digit numbers with a leading zero
function padZero(num) {
  return num < 10 ? "0" + num : num;
}

module.exports = questRouter;
