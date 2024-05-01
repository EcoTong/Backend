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
postRouter.post("/like", async (req, res) => {
  try {
    let { post_id, username } = req.body;
    let id = "LIKE_" + post_id + "_" + username;
    const like = await db.Like.create({
      id,
      post_id,
      username,
    });
    res.status(201).json({
      status: "success",
      data: like,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
postRouter.delete("/unlike", async (req, res) => {
  try {
    let { id } = req.body;
    const like = await db.Like.findOne({
      where: {
        id,
      },
    });
    console.log(like);
    if (like == null) {
      res.status(400).json({
        status: "error",
        message: "Like not found",
      });
      return;
    } else {
      await db.Like.destroy({
        where: {
          id,
          //username
        },
      });
      res.status(200).json({
        status: "success",
        message: "Unlike success",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
//bikin api buat ngambil semua like dari post_id
postRouter.get("/like/:post_id", async (req, res) => {
  try {
    let { post_id } = req.params;
    const likes = await db.Like.findAll({
      where: {
        post_id,
      },
    });
    res.status(200).json({
      status: "success",
      data: likes,
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
