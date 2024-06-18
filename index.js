require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./src/models");
// import {google} from 'googleapis';
const bcrypt = require("bcrypt");
require("dotenv").config();
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_SECRET;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const Router = require("./src/routes/Router");
const path = require("path");
const { OAuth2 } = google.auth;
const oAuth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/auth/google/callback"
);

const scopes = [
  "https://www.googleapis.com/auth/userinfo.profile",
  "https://www.googleapis.com/auth/userinfo.email",
];

const authorizationUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
  include_granted_scopes: true,
});
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.get("/auth/google", (req, res) => {
//   res.redirect(authorizationUrl);
// });
//google callback login
// app.get("/auth/google/callback", async (req, res) => {
//   const code = req.query.code;
//   try {
//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);
//     const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
//     const { data } = await oauth2.userinfo.get();
//     // return res.json({data : data.email});
//     if (!data) {
//       return res.json({ data: data, status: "error" });
//     } else {
//       let user = await db.User.findAll();
//       let sudahTerdaftar = false;
//       for (let i = 0; i < user.length; i++) {
//         if (user[i].email == data.email) {
//           // user = user[i];
//           sudahTerdaftar = true;
//           break;
//         }
//       }
//       // return res.json({ user: data, status: "success asdasd" });
//       if (sudahTerdaftar) {
//         //sudah terdaftar email tersebut
//         //return kan pesan bahwa sudah terdaftar
//         let token = jwt.sign(
//           {
//             username: user.username,
//             email: user.email,
//           },
//           JWT_KEY,
//           { expiresIn: "7200s" }
//         );
//         res.status(200).json({
//           status: "success login",
//           token: token,
//         });
//         // res.status(200).json({
//         //   status: "email udah terdaftar",
//         // });
//       } else {
//         //belum terdaftar
//         const hash_password = bcrypt.hashSync(data.id, SALT_ROUNDS);
//         user = await db.User.create({
//           email: data.email,
//           username: data.name,
//           password: "",
//           name: data.name,
//           profile_picture: "default.jpg",
//           credits: 0,
//         });
//         let token = jwt.sign(
//           {
//             username: user.username,
//             email: user.email,
//           },
//           JWT_KEY,
//           { expiresIn: "7200s" }
//         );
//         res.status(200).json({
//           status: "success register",
//           token: token,
//         });
//         // res.status(201).json({
//         //   status: "success register",
//         // });
//       }
//     }
//     // res.send('Login successful!');
//   } catch (error) {
//     console.error("Error retrieving access token", error);
//   }
// });

app.post("/api/auth/google", async (req, res) => {
  console.log(req.body);
  const { id_token } = req.body;

  try {
    const ticket = await oAuth2Client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;

    let user = await db.User.findOne({ where: { email } });
    if (user) {
      let token = jwt.sign(
        {
          username: user.username,
          email: user.email,
        },
        JWT_KEY
      );
      res.status(200).json({
        status: "success login",
        token: token,
      });
      // res.status(200).json({

      //   status: "email already registered",
      // });
    } else {
      const hash_password = bcrypt.hashSync(googleId, SALT_ROUNDS);

      // res.status(200).json({
      //   status: "success",
      //   token: token,
      // });
      user = await db.User.create({
        email,
        username: name,
        password: "", 
        name,
        profile_picture: "default.jpg",
        credits: 0,
      });
      let token = jwt.sign(
        {
          username: user.username,
          email: user.email,
        },
        JWT_KEY,
        { expiresIn: "7200s" }
      );
      //await db.User.create({
      //           email: data.email,
      //           username: data.name,
      //           password: "",
      //           name: data.name,
      //           profile_picture: "default.jpg",
      //           credits: 0,
      //         });
      res.status(201).json({
        status: "success register",
        token: token,
      });
    }
  } catch (error) {
    console.error("Error verifying token", error);
    res.status(400).json({ error: "Invalid token" });
  }
});

app.use('/postpictures', express.static(path.join(__dirname, 'uploads/posts')));
app.use('/profilepictures', express.static(path.join(__dirname, 'uploads/profilepictures')));
app.use('/rewardpictures', express.static(path.join(__dirname, 'uploads/rewards')));
app.use('/questpictures', express.static(path.join(__dirname, 'uploads/quests')));

const { PORT } = process.env;

app.use("/api", Router);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
