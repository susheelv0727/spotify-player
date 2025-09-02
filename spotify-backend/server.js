// server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import querystring from "querystring";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 8888;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "https://spotifyplayer-br00--5173--96435430.local-credentialless.webcontainer.io/callback";

app.post("/api/token", async (req, res) => {
  const { code } = req.body;

  try {
    const response = await axios.post(
      "https://accounts.spotify.com/api/token",
      querystring.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
      {
        headers: {
            Authorization: "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
            "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error);
    res.status(400).json({ error: "Token exchange failed" });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
