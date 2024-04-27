const { response } = require("express");
const express = require("express");
const userRouter = express.Router();
const { Op } = require("sequelize");
const { User } = require("../models");

userRouter.get("/", async (req, res) => {
  try {
    //const users = await User.findAll();
    res.status(200).json({
      status: "success",
      //data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

module.exports = userRouter;