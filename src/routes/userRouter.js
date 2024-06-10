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

module.exports = userRouter;
