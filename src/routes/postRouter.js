const { response } = require("express");
const express = require("express");
const postRouter = express.Router();
const { Op } = require("sequelize");
const db = require("../models");
const { post } = require("./userRouter");

postRouter.get("/", async (req, res) => {
  try {
    const posts = await db.Post.findAll();
    res.status(200).json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
postRouter.post("/tambahpost", async (req, res) => {
  try {
    let { username, category, image } = req.body;
    let id = "POST_" + username + "_" + formatDate(new Date());
    const newPost = await db.Post.create({
      id,
      username,
      picture: image,
      category,
    });
    res.status(201).json({
      status: "success",
      data: newPost,
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
module.exports = postRouter;
