const { response } = require("express");
const express = require("express");
const aiRouter = express.Router();
const { Op } = require("sequelize");
const db = require("../models");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_SECRET;
const multer = require("multer");
const path = require("path");

//make me a function as a middleware to validate the jwt token
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

aiRouter.get("/generateAi", validateToken, async (req, res) => {
    let { made_from, time1, time2 } = req.query;
    try {
        const { VertexAI } = require('@google-cloud/vertexai');

        // Initialize Vertex with your Cloud project and location
        const vertex_ai = new VertexAI({ project: 'ecotong-426314', location: 'us-central1' });
        const model = 'gemini-1.5-flash-001';

        // Instantiate the models
        const generativeModel = vertex_ai.preview.getGenerativeModel({
            model: model,
            generationConfig: {
                'maxOutputTokens': 8192,
                'temperature': 1.5,
                'topP': 0.95,
            },
            safetySettings: [
                {
                    'category': 'HARM_CATEGORY_HATE_SPEECH',
                    'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    'category': 'HARM_CATEGORY_DANGEROUS_CONTENT',
                    'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    'category': 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                    'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
                },
                {
                    'category': 'HARM_CATEGORY_HARASSMENT',
                    'threshold': 'BLOCK_MEDIUM_AND_ABOVE'
                }
            ],
        });


        async function generateContent() {
            const req = {
                contents: [
                    {
                        role: 'user', parts: [{
                            text: `recommend me only 1 inexpensive handycraft made from ${made_from} the handycraft must be able to made between ${time1} to ${time2} days for personal use and decoration with materials needed and steps
`}]
                    }
                ],
            };

            const result = await generativeModel.generateContent(req);
            const response = result.response;
            return result;
        }

        const tempGenerated = await generateContent();
        const history = await db.History.create({
            username: req.user.username,
            made_from: made_from,
            instruction: tempGenerated.response.candidates[0].content.parts[0].text
        });

        await res.status(200).json({
            status: "success",
            message: tempGenerated.response.candidates[0].content.parts[0].text,
        });

    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

module.exports = aiRouter;
