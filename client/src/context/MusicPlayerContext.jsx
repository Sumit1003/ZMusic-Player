import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from "react";

const MusicPlayerContext = createContext();

const initialState = {
  songs: [],
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  isRepeat: false,
  isShuffle: false,
  likedSongs: [],
  queue: [],
  currentIndex: 0,
  searchQuery: "",
  filteredSongs: [],
};

// 🎚 Reducer
const musicPlayerReducer = (state, action) => {
  switch (action.type) {
    case "SET_SONGS": {
      const songs = Array.isArray(action.payload) ? action.payload : [];
      return { ...state, songs, filteredSongs: songs };
    }

    case "SET_CURRENT_SONG":
      return {
        ...state,
        currentSong: action.payload.song || null,
        currentIndex: action.payload.index ?? 0,
        currentTime: 0,
      };

    case "SET_PLAYING":
      return { ...state, isPlaying: action.payload };

    case "SET_CURRENT_TIME":
      return { ...state, currentTime: action.payload };

    case "SET_DURATION":
      return { ...state, duration: action.payload };

    case "SET_VOLUME":
      return { ...state, volume: Math.min(1, Math.max(0, action.payload)) };

    case "TOGGLE_REPEAT":
      return { ...state, isRepeat: !state.isRepeat };

    case "TOGGLE_SHUFFLE":
      return { ...state, isShuffle: !state.isShuffle };

    case "TOGGLE_LIKE": {
      const songId = action.payload;
      if (!songId) return state;

      const isLiked = state.likedSongs.includes(songId);
      return {
        ...state,
        likedSongs: isLiked
          ? state.likedSongs.filter((id) => id !== songId)
          : [...state.likedSongs, songId],
      };
    }

    case "SET_SEARCH_QUERY": {
      const query = action.payload?.toLowerCase() || "";
      const filtered =
        query === ""
          ? state.songs
          : state.songs.filter((song) =>
              ["title", "artist", "album", "genre"].some((key) =>
                song[key]?.toLowerCase().includes(query)
              )
            );

      return { ...state, searchQuery: action.payload, filteredSongs: filtered };
    }

    case "NEXT_SONG": {
      if (!state.songs.length) return state;

      let nextIndex;
      if (state.isShuffle) {
        do {
          nextIndex = Math.floor(Math.random() * state.songs.length);
        } while (nextIndex === state.currentIndex && state.songs.length > 1);
      } else {
        nextIndex = (state.currentIndex + 1) % state.songs.length;
      }

      return {
        ...state,
        currentIndex: nextIndex,
        currentSong: state.songs[nextIndex],
        currentTime: 0,
      };
    }

    case "PREVIOUS_SONG": {
      if (!state.songs.length) return state;
      const prevIndex =
        state.currentIndex === 0
          ? state.songs.length - 1
          : state.currentIndex - 1;
      return {
        ...state,
        currentIndex: prevIndex,
        currentSong: state.songs[prevIndex],
        currentTime: 0,
      };
    }

    case "SET_CURRENT_INDEX":
      if (!state.songs.length) return state;
      return {
        ...state,
        currentIndex: action.payload,
        currentSong: state.songs[action.payload],
        currentTime: 0,
      };

    case "LOAD_LIKED_SONGS":
      return { ...state, likedSongs: action.payload || [] };

    default:
      return state;
  }
};

export const MusicPlayerProvider = ({ children }) => {
  const [state, dispatch] = useReducer(musicPlayerReducer, initialState);

  // 🧠 Load liked songs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("likedSongs");
      if (saved) {
        dispatch({
          type: "LOAD_LIKED_SONGS",
          payload: JSON.parse(saved),
        });
      }
    } catch (error) {
      console.warn("⚠️ Could not load liked songs:", error);
    }
  }, []);

  // 💾 Persist liked songs
  useEffect(() => {
    try {
      localStorage.setItem("likedSongs", JSON.stringify(state.likedSongs));
    } catch (error) {
      console.warn("⚠️ Could not save liked songs:", error);
    }
  }, [state.likedSongs]);

  // 🎵 Actions
  const playSong = useCallback((song, index) => {
    if (!song) return;
    dispatch({ type: "SET_CURRENT_SONG", payload: { song, index } });
    dispatch({ type: "SET_PLAYING", payload: true });
  }, []);

  const togglePlay = useCallback(() => {
    if (!state.currentSong && state.songs.length > 0) {
      dispatch({
        type: "SET_CURRENT_SONG",
        payload: { song: state.songs[0], index: 0 },
      });
    }
    dispatch({ type: "SET_PLAYING", payload: !state.isPlaying });
  }, [state.currentSong, state.isPlaying, state.songs]);

  const nextSong = useCallback(() => {
    if (state.songs.length > 0) {
      dispatch({ type: "NEXT_SONG" });
    }
  }, [state.songs.length]);

  const previousSong = useCallback(() => {
    if (state.songs.length > 0) {
      dispatch({ type: "PREVIOUS_SONG" });
    }
  }, [state.songs.length]);

  const toggleLike = useCallback((songId) => {
    dispatch({ type: "TOGGLE_LIKE", payload: songId });
  }, []);

  const toggleRepeat = useCallback(() => {
    dispatch({ type: "TOGGLE_REPEAT" });
  }, []);

  const toggleShuffle = useCallback(() => {
    dispatch({ type: "TOGGLE_SHUFFLE" });
  }, []);

  const setVolume = useCallback((volume) => {
    dispatch({ type: "SET_VOLUME", payload: volume });
  }, []);

  const setCurrentTime = useCallback((time) => {
    dispatch({ type: "SET_CURRENT_TIME", payload: time });
  }, []);

  const setDuration = useCallback((duration) => {
    dispatch({ type: "SET_DURATION", payload: duration });
  }, []);

  const setSearchQuery = useCallback((query) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  }, []);

  const setSongs = useCallback((songs) => {
    dispatch({ type: "SET_SONGS", payload: songs });
  }, []);

  const value = {
    ...state,
    playSong,
    togglePlay,
    nextSong,
    previousSong,
    toggleLike,
    toggleRepeat,
    toggleShuffle,
    setVolume,
    setCurrentTime,
    setDuration,
    setSearchQuery,
    setSongs,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (!context)
    throw new Error("useMusicPlayer must be used within a MusicPlayerProvider");
  return context;
};
