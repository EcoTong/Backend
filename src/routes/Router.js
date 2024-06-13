const express = require("express");
const userRouter = require("./userRouter");
const postRouter = require("./postRouter");
const questRouter = require("./questRouter");
const rewardRouter = require("./rewardRouter");
const router = express.Router();

router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/quests", questRouter);
router.use("/rewards", rewardRouter);
module.exports = router;
