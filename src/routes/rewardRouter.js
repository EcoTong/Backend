const { response } = require("express");
const express = require("express");
const rewardRouter = express.Router();
const { Op } = require("sequelize");
const db = require("../models");
const reward = require("../models/reward");
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
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/rewards/"); // Specify the destination directory
  },
  filename: (req, file, cb) => {
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // Get the file extension
    cb(null, file.fieldname + "-" + "REWARD_" + formatDate(new Date()) + ext); // Create a new file name
    // req.file = file.fieldname + "-" + req.user.username + ext;
    // next();
  },
});

const upload = multer({ storage: storage });
rewardRouter.get("/rewardpicture/:id", validateToken, async (req, res) => {
  try {
    let { id } = req.params;
    console.log("ini id " + id);
    
    const reward = await Reward.findOne({
      where: {
        id,
      },
    });
    console.log("ini reward " + reward);

    if (!reward) {
      return res.status(404).json({
        status: "error",
        message: "Reward not found",
      });
    }

    // Construct the URL to the reward picture
    const rewardPicturePath = `/rewardpictures/${reward.picture}`;
    res.redirect(rewardPicturePath);
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
rewardRouter.get("/", async (req, res) => {
  try {
    const rewards = await db.Reward.findAll();
    res.status(200).json({
      status: "success",
      data: rewards,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
//bikin api buat ambil reward by id
rewardRouter.get("/:id", async (req, res) => {
  try {
    let { id } = req.params;
    const reward = await db.Reward.findOne({
      where: {
        id,
      },
    });
    if (reward == null) {
      res.status(404).json({
        status: "error",
        message: "Reward not found",
      });
      return;
    }
    res.status(200).json({
      status: "success",
      data: reward,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
rewardRouter.post(
  "/tambahreward",
  upload.single("fotoreward"),
  async (req, res) => {
    const { name, point, description, title } = req.body;
    const file = req.file;
    const picture = file.filename;
    let id = "REWARD_" + name + "_" + formatDate(new Date());
    try {
      const reward = await db.Reward.create({
        id,
        name,
        title,
        point,
        picture,
        description,
      });
      res.status(201).json({
        status: "success",
        data: reward,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }
);
//bikin api buat update reward
// rewardRouter.put("/updatereward/:id", async (req, res) => {
//   try {
//     let id = req.params.id;
//     const reward = await db.Reward.findOne({
//       where: {
//         id,
//       },
//     });
//     if (!reward) {
//       res.status(404).json({
//         status: "error",
//         message: "Reward not found",
//       });
//       return;
//     }
//     reward.name = req.body.name;
//     reward.point = req.body.point;
//     reward.picture = req.body.picture;
//     reward.description = req.body.description;
//     await reward.save();

//     res.status(200).json({
//       status: "success",
//       data: reward,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// });
// //bikin api buat delete reward
// rewardRouter.delete("/deletereward/:id", async (req, res) => {
//   try {
//     let { id } = req.params;
//     const reward = await db.Reward.findOne({
//       where: {
//         id,
//       },
//     });
//     if (reward == null) {
//       res.status(404).json({
//         status: "error",
//         message: "Reward not found",
//       });
//       return;
//     }
//     await db.Reward.destroy({
//       where: {
//         id,
//       },
//     });
//     res.status(200).json({
//       status: "success",
//       message: "Reward deleted",
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "error",
//       message: error.message,
//     });
//   }
// });

//bikin api buat user redeem reward
rewardRouter.post("/redeemreward/:id", validateToken, async (req, res) => {
  try {
    let { id } = req.params;
    const reward = await db.Reward.findOne({
      where: {
        id,
      },
    });
    if (reward == null) {
      res.status(404).json({
        status: "error",
        message: "Reward not found",
      });
      return;
    }
    let user = req.user;
    if (user.credits < reward.point) {
      res.status(400).json({
        status: "error",
        message: "Not enough credits",
      });
      return;
    }
    user.credits -= reward.point;
    await user.save();
    //create a new redeem
    let redeem_id =
      "REDEEM_" +
      user.username +
      "_" +
      reward.id +
      "_" +
      formatDate(new Date());
    const redeem = await db.UserReward.create({
      username: user.username,
      reward_id: reward.id,
      id: redeem_id,
    });
    res.status(200).json({
      status: "success",
      message: "Reward redeemed",
      redeem: redeem,
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
module.exports = rewardRouter;
