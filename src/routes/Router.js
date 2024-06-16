const express = require("express");
const userRouter = require("./userRouter");
const postRouter = require("./postRouter");
const questRouter = require("./questRouter");
const rewardRouter = require("./rewardRouter");
const UserRewardRouter = require("./userrewardRouter");
const aiRouter = require("./aiRouter");
const router = express.Router();

router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/quests", questRouter);
router.use("/rewards", rewardRouter);
router.use("/userrewards", UserRewardRouter);
router.use("/ai", aiRouter);
module.exports = router;
