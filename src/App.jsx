import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const CLIENT_ID = import.meta.env.VITE_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SCOPES = ["user-read-private", "user-read-email", "streaming"].join("%20");

function App() {
  const [token, setToken] = useState("");
  const [newSongs, setNewSongs] = useState([]);
  const hasExchangedToken = useRef(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const error = urlParams.get("error");

    console.log("URL params:", { code, error, fullUrl: window.location.href });

    if (error) {
      console.error("Spotify authorization error:", error);
      alert(`Login failed: ${error}`);
      return;
    }

    if (code && !hasExchangedToken.current) {
      console.log("Authorization code received, exchanging for token...");
      hasExchangedToken.current = true;
      
      axios
        .post("http://127.0.0.1:8888/api/token", { code })
        .then((res) => {
          console.log("Token exchange successful:", res.data);
          setToken(res.data.access_token);
          window.history.replaceState({}, document.title, "/");
        })
        .catch((error) => {
          console.error("Token exchange failed:", error.response?.data || error.message);
          hasExchangedToken.current = false; // Reset on error so retry is possible
        });
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    axios
      .get("https://api.spotify.com/v1/browse/new-releases?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNewSongs(res.data.albums.items))
      .catch((error) => {
        console.error("Failed to fetch new releases:", error);
      });
  }, [token]);

  const login = () => {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=${encodeURIComponent(SCOPES)}`;
    
    window.location.href = authUrl;
  };

  return (
    <div>
      {!token ? (
        <button onClick={login}>Login with Spotify</button>
      ) : (
        <div>
          <h1>New Releases</h1>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {newSongs.map((song) => (
              <div key={song.id} style={{ margin: 10 }}>
                <img src={song.images[0].url} alt={song.name} width={150} />
                <p>{song.name}</p>
                <audio src={song.preview_url} controls />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
