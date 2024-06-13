const { response } = require("express");
const express = require("express");
const postRouter = express.Router();
const { Op } = require("sequelize");
const db = require("../models");
const { post } = require("./userRouter");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_SECRET;
const multer = require("multer");
const path = require("path");
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
//buat api buat ngambil satu post by id post
postRouter.get("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const post = await db.Post.findOne({
      where: {
        id,
      },
    });
    if (post == null) {
      res.status(404).json({
        status: "error",
        message: "Post not found",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: post,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/posts/"); // Specify the destination directory
  },
  filename: (req, file, cb) => {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // Get the file extension
    cb(null, file.fieldname + "-" + "POST_" + req.user.username + "_" + formatDate(new Date()) + ext); // Create a new file name
    // req.file = file.fieldname + "-" + req.user.username + ext;
    // next();
  },
});

const upload = multer({ storage: storage });
postRouter.post(
  "/tambahpost",
  validateToken,
  upload.single("fotopost"),
  async (req, res) => {
    try {
      const file = req.file;
      const filename = file.filename; // Get the filename
      let { category } = req.body;
      let username = req.user.dataValues.username;
      console.log(req.user.dataValues.username);
      let id = "POST_" + username + "_" + formatDate(new Date());
      const newPost = await db.Post.create({
        id,
        username,
        picture: filename,
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
  }
);
postRouter.post("/like/:id_post", validateToken, async (req, res) => {
  try {
    let  username  = req.user.dataValues.username;
    let { post_id } = req.params.id_post;
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
postRouter.delete("/unlike/:id_post", validateToken, async (req, res) => {
  try {
    let { id } = req.params.id_post;
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
postRouter.get("/like/:post_id", validateToken, async (req, res) => {
  try {
    let { post_id } = req.params;
    const likes = await db.Like.findAll({
      where: {
        post_id,
      },
    });
    const banyak = likes.length;
    res.status(200).json({
      status: "success",
      banyak_like: banyak,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
//bikin api buat nambah comment pada post
postRouter.post("/comment/:id_post", validateToken, async (req, res) => {
  try {
    let { content } = req.body;
    let  username  = req.user.dataValues.username;
    let { post_id } = req.params.id_post;
    let id = "COMMENT_" + post_id + "_" + username;
    const newComment = await db.Comment.create({
      id,
      post_id,
      username,
      content,
    });
    res.status(201).json({
      status: "success",
      data: newComment,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
//bikin api buat bookmark post
postRouter.post("/bookmark/:id_post", validateToken, async (req, res) => {
  try {
    // let {  username } = req.body;
    let  username  = req.user.dataValues.username;
    let { post_id } = req.params.id_post;
    let id = "BOOKMARK_" + post_id + "_" + username;
    const bookmark = await db.Bookmark.create({
      id,
      post_id,
      username,
    });
    res.status(201).json({
      status: "success",
      data: bookmark,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
//bikin api buat unbookmark post
postRouter.delete("/unbookmark/:id_post", async (req, res) => {
  try {
    let { id } = req.params.id_post;
    const bookmark = await db.Bookmark.findOne({
      where: {
        id,
      },
    });
    if (bookmark == null) {
      res.status(400).json({
        status: "error",
        message: "Bookmark not found",
      });
      return;
    } else {
      await db.Bookmark.destroy({
        where: {
          id,
        },
      });
      res.status(200).json({
        status: "success",
        message: "Unbookmark success",
      });
    }
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
  return `${year}-${month}-${day} ${hours} ${minutes} ${seconds}`;
}

// Function to pad single digit numbers with a leading zero
function padZero(num) {
  return num < 10 ? "0" + num : num;
}
module.exports = postRouter;
