require("dotenv").config();
const express = require("express");
const app = express();
const db = require("./src/models");
// import {google} from 'googleapis';
const bcrypt = require("bcrypt");
require("dotenv").config();
const { google } = require("googleapis");
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS);
const Router = require("./src/routes/Router");

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

app.get("/auth/google", (req, res) => {
  res.redirect(authorizationUrl);
});
//google callback login
app.get("/auth/google/callback", async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const { data } = await oauth2.userinfo.get();
    // return res.json({data : data.email});
    if (!data) {
      return res.json({ data: data, status: "error" });
    } else {
      let user = await db.User.findAll();
      let sudahTerdaftar = false;
      for (let i = 0; i < user.length; i++) {
        if (user[i].email == data.email) {
          // user = user[i];
          sudahTerdaftar = true;
          break;
        }
      }
      // return res.json({ user: data, status: "success asdasd" });
      if (sudahTerdaftar) {
        //sudah terdaftar email tersebut
        //return kan pesan bahwa sudah terdaftar
        res.status(200).json({
          status: "email udah terdaftar",
        });
      } else {
        //belum terdaftar
        const hash_password = bcrypt.hashSync(data.id, SALT_ROUNDS);
        user = await db.User.create({
          email: data.email,
          username: data.name,
          password: hash_password,
          name: data.name,
          profile_picture: "default.jpg",
          credits: 0,
        });
        res.status(201).json({
          status: "success register",
        });
      }
    }
    // res.send('Login successful!');
  } catch (error) {
    console.error("Error retrieving access token", error);
  }
});

const { PORT } = process.env;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", Router);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
