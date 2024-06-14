const { response } = require("express");
const express = require("express");
const bcrypt = require("bcrypt");
const userRouter = express.Router();

const { Op } = require("sequelize");
const { User } = require("../models");
require("dotenv").config();
const db = require("../models");
const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_SECRET;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
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
userRouter.get("/profilepicture", validateToken, async (req, res) => {
  try {
    let username = req.user.dataValues.username;
    console.log("ini username "+username)
    const users = await User.findAll();
    // use for to find the user by username
    console.log("ini users "+users)
    let user;
    for (let i = 0; i < users.length; i++) {
      if (users[i].username == username) {
        user = users[i];
        break;
      }
    }
    console.log("ini user "+user)
   
    if (user == null) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }
    res.sendFile(path.join(__dirname, "../../uploads/profilepictures", user.profile_picture));
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
userRouter.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({
      status: "success",
      users: users,
      //data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
//buatkan api untuk mengambil satu user by username beserta serving foto profile
userRouter.get("/:username", async (req, res) => {
  try {
    let { username } = req.params;
    const user = await db.User.findOne({
      where: {
        username,
      },
    });
    if (user == null) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
//buatkan api untuk mengambil foto profile username yang login saat ini dari folder lokasi foto disimpan
userRouter.post("/register", async (req, res) => {
  try {
    let { username, email, password, name } = req.body;
    //make sure the email is in correct email format
    if (!email.includes("@") || !email.includes(".")) {
      res.status(400).json({
        status: "error",
        message: "Email is not in correct format",
      });
      return;
    }
    const hash_password = bcrypt.hashSync(password, SALT_ROUNDS);
    const user = await db.User.findOne({ where: { username: username } });
    if (user) {
      res.status(400).json({
        status: "error",
        message: "Username already exists",
      });
    } //make sure the email is unique
    else if (await db.User.findOne({ where: { email: email } })) {
      res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    } //create a new user
    else {
      const newUser = await db.User.create({
        username,
        email,
        password: hash_password,
        name,
        profile_picture: "default.jpg",
        credits: 0,
      });
      res.status(201).json({
        status: "success",
        data: newUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

userRouter.post("/login", async (req, res) => {
  try {
    let { email, password } = req.body;
    const user = await db.User.findOne({ where: { email: email } });
    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        let token = jwt.sign(
          {
            username: user.username,
            email: user.email,
          },
          JWT_KEY,
          { expiresIn: "7200s" }
        );
        res.status(200).json({
          status: "success",
          token: token,
        });
      } else {
        res.status(400).json({
          status: "error",
          message: "Wrong Password",
        });
      }
    } else {
      res.status(400).json({
        status: "error",
        message: "Account Not Found",
      });
    }
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

//buatkan api untuk mengganti profile picture
// Configure Multer storage to rename files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/profilepictures"); // Specify the destination directory
  },
  filename: (req, file, cb) => {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // Get the file extension
    cb(null, file.fieldname + "-" + req.user.username + ext); // Create a new file name
    req.file = file.fieldname + "-" + req.user.username + ext;
    // next();
  },
});

const upload = multer({ storage: storage });
userRouter.put(
  "/profile_picture",
  validateToken,
  upload.single("fotoprofile"),
  async (req, res) => {
    try {
      const file = req.file;
      const filename = file.filename; // Get the filename
      console.log("File Object:", JSON.stringify(req.file, null, 2)); // Logs the file object with formatting
      console.log("ini object file " + filename);
      
      let username = req.user.username;
      const user = await db.User.findOne({
        where: {
          username,
        },
      });
      if (user == null) {
        res.status(404).json({
          status: "error",
          message: "User not found",
        });
        return;
      }
      user.profile_picture = filename;
      await user.save();
      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
);

module.exports = userRouter;
