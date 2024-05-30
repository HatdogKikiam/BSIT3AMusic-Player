let currentPlaylist = [];
let shuffledPlaylist = [];
let currentTrackIndex = 0;

// Shuffle function
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Event listener for shuffle button
document.getElementById('shuffleButton').addEventListener('click', () => {
  if (currentPlaylist.length > 0) {
    shuffledPlaylist = shuffleArray([...currentPlaylist]);
    currentTrackIndex = 0;
    playTrack(shuffledPlaylist[currentTrackIndex]);
  }
});

const playTrack = async (track) => {
  const audioPlayer = document.getElementById('audioPlayer');
  const playerDiv = document.getElementById('player');
  const resultsDiv = document.getElementById('results');
  const trackInfoDiv = document.getElementById('trackInfo');
  const searchDiv = document.getElementById('search');
  const coverArt = document.getElementById('coverArt');

  if (track.preview_url) {
    audioPlayer.src = track.preview_url;
    audioPlayer.play();

    trackInfoDiv.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;
    coverArt.src = track.album.images[0].url;

    playerDiv.style.display = 'flex';
    resultsDiv.style.display = 'none';
    searchDiv.style.display = 'none';
  } else {
    alert('No preview available for this track.');
  }

  // Event listener for audio player to play the next track when the current one ends
  audioPlayer.onended = () => {
    currentTrackIndex++;
    if (currentTrackIndex < shuffledPlaylist.length) {
      playTrack(shuffledPlaylist[currentTrackIndex]);
    } else {
      // Playlist ended, reset index
      currentTrackIndex = 0;
    }
  };

  // Event listener for go back to search
  document.getElementById('goBack').addEventListener('click', () => {
    playerDiv.style.display = 'none';
    resultsDiv.style.display = 'flex';
    searchDiv.style.display = 'block';
    searchInput.value = '';

    audioPlayer.pause();
  });
};

document.getElementById('searchButton').addEventListener('click', async () => {
  const query = document.getElementById('searchInput').value;
  const response = await fetch(`/search?q=${encodeURIComponent(query)}`);
  const data = await response.json();

  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';
  currentPlaylist = data.tracks.items;
  shuffledPlaylist = [...currentPlaylist];  // Initialize shuffledPlaylist

  data.tracks.items.forEach(track => {
    const trackDiv = document.createElement('div');
    trackDiv.classList.add('result-item');

    const trackInfo = document.createElement('p');
    trackInfo.textContent = `${track.name} by ${track.artists.map(artist => artist.name).join(', ')}`;
    trackDiv.appendChild(trackInfo);

    if (track.album && track.album.images && track.album.images.length > 0) {
      const coverImg = document.createElement('img');
      coverImg.src = track.album.images[0].url;
      coverImg.alt = 'Track Cover';
      trackDiv.appendChild(coverImg);
    }

    trackDiv.addEventListener('click', async () => {
      try {
        const lyricsResponse = await fetch(`/lyrics?track=${encodeURIComponent(track.name)}&artist=${encodeURIComponent(track.artists[0].name)}`);
        const lyricsData = await lyricsResponse.json();
        const lyricsDiv = document.getElementById('lyrics');
        lyricsDiv.textContent = lyricsData.lyrics;
      } catch (error) {
        console.error('Error fetching lyrics:', error);
        const lyricsDiv = document.getElementById('lyrics');
        lyricsDiv.textContent = 'Lyrics not available.';
      }
      playTrack(track);
    });

    resultsDiv.appendChild(trackDiv);
  });
});

// Event listener for next button
document.getElementById('nextButton').addEventListener('click', () => {
  playNextTrack();
});

// Event listener for previous button
document.getElementById('previousButton').addEventListener('click', () => {
  playPreviousTrack();
});

const playNextTrack = () => {
  currentTrackIndex++;
  if (currentTrackIndex < shuffledPlaylist.length) {
    playTrack(shuffledPlaylist[currentTrackIndex]);
  } else {
    // If the end of the playlist is reached, loop back to the beginning
    currentTrackIndex = 0;
    playTrack(shuffledPlaylist[currentTrackIndex]);
  }
};

const playPreviousTrack = () => {
  if (currentPlaylist.length > 0) {
    currentTrackIndex = (currentTrackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    playTrack(currentPlaylist[currentTrackIndex]);
  }
};
