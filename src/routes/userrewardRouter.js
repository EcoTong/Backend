const { response } = require("express");
const express = require("express");
const UserRewardRouter = express.Router();
const { Op } = require("sequelize");
const db = require("../models");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_SECRET;
const multer = require("multer");
const path = require("path");

UserRewardRouter.get("/:username", async (req, res) => {
  try {
    let { username } = req.params;
    const userreward = await db.UserReward.findAll({
      where: {
        username,
      },
    });
    res.json(userreward);
  } catch (error) {
    console.log(error);
  }
});
//bikin api buat ambil userreward by id
UserRewardRouter.get("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const userreward = await db.UserReward.findAll({
      where: {
        id,
      },
    });
    res.json(userreward);
  } catch (error) {
    console.log(error);
  }
});

UserRewardRouter.get("/", async (req, res) => {
  try {
    const userreward = await db.UserReward.findAll();
    res.json(userreward);
  } catch (error) {
    console.log(error);
  }
});
//bikin api buat ambil userreward by username

module.exports = UserRewardRouter;
