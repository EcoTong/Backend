const { response } = require("express");
const express = require("express");
const questRouter = express.Router();
const { Op } = require("sequelize");
const db = require("../models");


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
    }
);

//bikin api buat post quest
questRouter.post("/tambahquest", async (req, res) => {
    try {
        let { username, prize, description, category, picture } = req.body;
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
    }
);
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