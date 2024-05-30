const express = require('express');
const axios = require('axios');
const querystring = require('querystring');
require('dotenv').config();
const path = require('path');

const app = express();
const port = 8888;

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

let access_token = '';

const getAccessToken = async () => {
  const response = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
    grant_type: 'client_credentials'
  }), {
    headers: {
      'Authorization': 'Basic ' + (Buffer.from(client_id + ':' + client_secret).toString('base64')),
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  access_token = response.data.access_token;
};

// Fetch access token initially and then refresh it every hour
getAccessToken();
setInterval(getAccessToken, 3600 * 1000);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    const response = await axios.get(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).send('Error fetching search results');
  }
});

app.get('/lyrics', async (req, res) => {
  try {
    const track = req.query.track;
    const artist = req.query.artist;
    // Use a lyrics API here, for example, Genius API
    // This is a placeholder response
    res.json({ lyrics: `Lyrics for ${track} by ${artist}` });
  } catch (error) {
    res.status(500).send('Error fetching lyrics');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
