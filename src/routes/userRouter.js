const { response } = require("express");
const express = require("express");
const bcrypt = require("bcrypt");
const userRouter = express.Router();

const { Op } = require("sequelize");
const { User } = require("../models");
require("dotenv").config();
const db = require("../models");
const  SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);

userRouter.get("/", async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({
      status: "success",
      users:users
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
    let { username, email, password, name} = req.body;
    const hash_password = bcrypt.hashSync(
      password,
      SALT_ROUNDS
    );
    const user = await db.User.findOne({ where: { username: username } });
    if(user){
      res.status(400).json({
        status: "error",
        message: "Username already exists",
      });
    } else {
      const newUser = await db.User.create({ username, email, password :hash_password, name, profile_picture: "default.jpg",credits: 0});
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
    let { username, password} = req.body;
    const user = await db.User.findOne({ where: { username: username } });
    if(user){
      if(bcrypt.compareSync(password,user.password)){
        res.status(200).json({
          status: "success",
          data: user,
        });
      } else{
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
