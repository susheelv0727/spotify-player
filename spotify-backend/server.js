// server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import querystring from "querystring";

dotenv.config({ path: '../.env' });

const app = express();
app.use(cors({
  origin: ['http://127.0.0.1:5173', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!", timestamp: new Date().toISOString() });
});

const PORT = 8888;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

app.post("/api/token", async (req, res) => {
  const { code } = req.body;
  console.log("Received authorization code:", code);

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

    console.log("Token exchange successful");
    res.json(response.data);
  } catch (error) {
    console.error("Token exchange failed:", error.response?.data || error.message);
    res.status(400).json({ 
      error: "Token exchange failed", 
      details: error.response?.data || error.message 
    });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
