const express = require("express");
const userRouter = require("./userRouter");
const postRouter = require("./postRouter");
const questRouter = require("./questRouter");
const router = express.Router();

router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/quests", questRouter);

module.exports = router;
