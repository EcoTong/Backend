const { response } = require("express");
const express = require("express");
const questRouter = express.Router();
const { Op } = require("sequelize");
const db = require("../models");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_SECRET;
const multer = require("multer");
const path = require("path");

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
questRouter.get("/questpicture/:id", validateToken, async (req, res) => {
  try {
    let { id } = req.params;
    console.log("ini id " + id)
    const quest = await db.Quest.findOne({
      where: {
        id,
      },
    });
    res.sendFile(path.join(__dirname, "../../uploads/quests", `${quest.picture}`));
  } catch (error) {
    res.status(500).json({
      status: "errorrrr",
      message: error.message,
    });
  }
});
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
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/quests/"); // Specify the destination directory
  },
  filename: (req, file, cb) => {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // Get the file extension
    cb(
      null,
      file.fieldname +
        "-" +
        "QUEST_" +
        req.user.username +
        "_" +
        formatDate(new Date()) +
        ext
    ); // Create a new file name
    // req.file = file.fieldname + "-" + req.user.username + ext;
    // next();
  },
});

const upload = multer({ storage: storage });
//bikin api buat post quest
questRouter.post(
  "/tambahquest",
  validateToken,
  upload.single("fotoquest"),
  async (req, res) => {
    try {
      let { prize, description, title } = req.body;
      const file = req.file;
      const filename = file.filename; // Get the filename
      let username = req.user.dataValues.username;
      let id = "QUEST_" + username + "_" + formatDate(new Date());
      const newQuest = await db.Quest.create({
        id,
        username,
        prize,
        description,
        title,
        picture: filename,
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
  }
);
//bikin api buat update quest
questRouter.put("/updatequest/:id", validateToken, async (req, res) => {
  try {
    let username = req.user.dataValues.username;
    let id = req.params.id;
    const quest = await db.Quest.findOne({
      where: {
        id,
        username,
      },
    });
    if (!quest) {
      res.status(404).json({
        status: "error",
        message: "Quest not found",
      });
      return;
    }

    //find the user and add the credits
    const user = await db.User.findOne({
      where: { username },
    });
    user.credits += quest.prize;
    await user.save();

    quest.status = true;
    await quest.save();
    res.status(200).json({
      status: "success selesai quest",
      data: quest,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
//bikin api buat ambil quest berdasarkan id quest
questRouter.get("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const quest = await db.Quest.findOne({
      where: {
        id,
      },
    });
    if (quest == null) {
      res.status(404).json({
        status: "error",
        message: "Quest not found",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: quest,
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
  return `${year}-${month}-${day} ${hours} ${minutes} ${seconds}`;
}

// Function to pad single digit numbers with a leading zero
function padZero(num) {
  return num < 10 ? "0" + num : num;
}

module.exports = questRouter;
