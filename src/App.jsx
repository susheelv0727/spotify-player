import React, { useEffect, useState } from "react";
import axios from "axios";

const CLIENT_ID = "2b1cf779107449da8b05a4c73ba19038";
const REDIRECT_URI = "https://spotifyplayer-br00--5173--96435430.local-credentialless.webcontainer.io/callback";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const SCOPES = ["user-read-private", "user-read-email", "streaming"].join("%20");

function App() {
  const [token, setToken] = useState("");
  const [newSongs, setNewSongs] = useState([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      axios
        .post("http://localhost:8888/api/token", { code })
        .then((res) => {
          setToken(res.data.access_token);
          window.history.replaceState({}, document.title, "/");
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    if (!token) return;

    axios
      .get("https://api.spotify.com/v1/browse/new-releases?limit=10", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setNewSongs(res.data.albums.items))
      .catch(console.error);
  }, [token]);

  const login = () => {
    const authUrl = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${REDIRECT_URI}&scope=${SCOPES}`;
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
