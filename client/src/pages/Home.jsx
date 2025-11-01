import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Library, 
  ArrowRight, 
  Play, 
  Pause,
  Heart,
  TrendingUp, 
  Users, 
  Radio,
  Star,
  Clock,
  Music,
  Sparkles,
  Shuffle,
  Repeat,
  Mic2,
  Disc3,
  ChevronLeft,
  Search,
  Filter,
  Grid3X3,
  List,
  Plus,
  Download,
  Share2,
  MoreHorizontal
} from "lucide-react";

import SongCard from "../components/SongCard";
import Navbar from "../components/Navbar";
import { useMusicPlayer } from "../context/MusicPlayerContext";

const Home = () => {
  const {
    setSongs,
    filteredSongs,
    searchQuery,
    songs,
    currentSong,
    isPlaying,
    playSong,
    togglePlay,
    toggleLike,
    likedSongs
  } = useMusicPlayer();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [featuredSongs, setFeaturedSongs] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [recentSongs, setRecentSongs] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showQuickStats, setShowQuickStats] = useState(true);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Helper to create unique keys
  const getUniqueKey = (song, index) => {
    return `${song.id}-${song.title}-${index}`;
  };

  // --- Add helper to resolve image URLs coming from backend ---
  const getImageUrl = (img) => {
    const placeholder = `https://picsum.photos/seed/no-image/600/600`;
    if (!img) return placeholder;
    if (img.startsWith("http") || img.startsWith("data:")) return img;
    if (img.startsWith("/")) return `${API_BASE}${img}`;
    return `${API_BASE}/${img}`;
  };

  // 🎵 Fetch Songs and Process Data
  const fetchSongs = useCallback(
    async (page = 1, append = false) => {
      try {
        if (!append) setLoading(true);
        setError(null);

        const limit = 20;
        const API_URL = `${API_BASE}/api/songs?page=${page}&limit=${limit}`;

        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const result = await response.json();

        let songsData = [];

        if (Array.isArray(result)) {
          songsData = result;
        } else if (result.data && Array.isArray(result.data)) {
          songsData = result.data;
        } else if (result.songs && Array.isArray(result.songs)) {
          songsData = result.songs;
        }

        if (!songsData.length) {
          throw new Error("No songs found");
        }

        // Remove duplicates based on ID
        const uniqueSongs = songsData.filter((song, index, self) =>
          index === self.findIndex(s => s.id === song.id)
        );

        // Normalize/resolve image URLs
        const normalizedSongs = uniqueSongs.map((s) => ({
          ...s,
          image: getImageUrl(s.image)
        }));

        setSongs(normalizedSongs);
        processSections(normalizedSongs);
        
      } catch (err) {
        console.error("❌ Error fetching songs:", err);
        let msg = "Failed to fetch songs from server.";
        if (err.message.includes("Failed to fetch"))
          msg = "Cannot connect to server. Ensure backend is running.";
        else if (err.message.includes("HTTP"))
          msg = `Server returned ${err.message}`;
        else if (err.message.includes("No songs"))
          msg = "No songs found in the database.";
        setError(msg);
        setSongs([]);
      } finally {
        setLoading(false);
      }
  }, [API_BASE, setSongs]);

  // Process songs into different sections
  const processSections = (songsData) => {
    // Featured songs (first 4 with images)
    setFeaturedSongs(songsData.filter(song => song.image).slice(0, 4));
    
    // Trending songs (random 8 songs)
    setTrendingSongs([...songsData].sort(() => 0.5 - Math.random()).slice(0, 8));
    
    // Recent songs (last 6 added)
    setRecentSongs([...songsData].reverse().slice(0, 6));
    
    // Extract artists with enhanced data
    const artistMap = {};
    songsData.forEach(song => {
      if (song.artist) {
        if (!artistMap[song.artist]) {
          artistMap[song.artist] = {
            name: song.artist,
            songCount: 0,
            totalLikes: 0,
            image: song.image || `https://picsum.photos/seed/${song.artist}/200`
          };
        }
        artistMap[song.artist].songCount++;
        if (likedSongs.includes(song.id)) {
          artistMap[song.artist].totalLikes++;
        }
      }
    });
    setArtists(Object.values(artistMap).slice(0, 8));
    
    // Extract albums with enhanced data
    const albumMap = {};
    songsData.forEach(song => {
      if (song.album) {
        if (!albumMap[song.album]) {
          albumMap[song.album] = {
            name: song.album,
            artist: song.artist,
            songCount: 0,
            totalLikes: 0,
            image: song.image || `https://picsum.photos/seed/${song.album}/300`
          };
        }
        albumMap[song.album].songCount++;
        if (likedSongs.includes(song.id)) {
          albumMap[song.album].totalLikes++;
        }
      }
    });
    setAlbums(Object.values(albumMap).slice(0, 8));
  };

  // 🧩 Initial load
  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Update sections when liked songs change
  useEffect(() => {
    if (songs.length > 0) {
      processSections(songs);
    }
  }, [likedSongs]);

  // Auto-slide for featured section
  useEffect(() => {
    if (featuredSongs.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(featuredSongs.length, 4));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [featuredSongs.length]);

  const retryConnection = () => {
    setError(null);
    fetchSongs();
  };

  const handleSongPlay = (song, index) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, index);
    }
  };

  const handlePlayAll = (songsArray) => {
    if (songsArray.length > 0) {
      playSong(songsArray[0], 0);
    }
  };

  const handleShufflePlay = (songsArray) => {
    if (songsArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * songsArray.length);
      playSong(songsArray[randomIndex], randomIndex);
    }
  };

  const handleLike = (songId, e) => {
    e.stopPropagation();
    toggleLike(songId);
  };

  const isLiked = (songId) => likedSongs.includes(songId);

  // Add this new function to get songs by album
  const getSongsByAlbum = (albumName) => {
    return songs.filter(song => song.album === albumName);
  };

  // Add helper to get songs by artist (new)
  const getSongsByArtist = (artistName) => {
    return songs.filter(song => song.artist === artistName);
  };

  // -------------------------
  // Keyboard navigation helpers
  // -------------------------
  const playNextSong = useCallback(() => {
    if (!songs || songs.length === 0) return;
    if (!currentSong) {
      playSong(songs[0], 0);
      return;
    }
    const idx = songs.findIndex(s => s.id === currentSong.id);
    const next = (idx + 1) % songs.length;
    playSong(songs[next], next);
  }, [songs, currentSong, playSong]);

  const playPrevSong = useCallback(() => {
    if (!songs || songs.length === 0) return;
    if (!currentSong) {
      playSong(songs[0], 0);
      return;
    }
    const idx = songs.findIndex(s => s.id === currentSong.id);
    const prev = (idx - 1 + songs.length) % songs.length;
    playSong(songs[prev], prev);
  }, [songs, currentSong, playSong]);

  const scrollByViewport = (direction = 1) => {
    try {
      window.scrollBy({
        top: direction * Math.round(window.innerHeight * 0.85),
        left: 0,
        behavior: "smooth"
      });
    } catch (e) {
      // ignore in non-browser environments
    }
  };

  const changeFeaturedSlide = (delta) => {
    const maxSlides = Math.min(Math.max(0, featuredSongs.length), 4);
    if (maxSlides <= 0) return;
    setCurrentSlide(prev => (prev + delta + maxSlides) % maxSlides);
  };

  // -------------------------
  // Keyboard event listener
  // -------------------------
  useEffect(() => {
    const onKeyDown = (e) => {
      // ignore when typing in inputs or contenteditable
      const active = document.activeElement;
      const tag = active?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || active?.isContentEditable;
      if (isTyping) return;

      switch (e.key) {
        case " ":
          // Space -> toggle play/pause (prevent page scroll)
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          playNextSong();
          break;
        case "ArrowLeft":
          playPrevSong();
          break;
        case "ArrowDown":
          scrollByViewport(1);
          break;
        case "ArrowUp":
          scrollByViewport(-1);
          break;
        case "PageDown":
          changeFeaturedSlide(1);
          break;
        case "PageUp":
          changeFeaturedSlide(-1);
          break;
        case "l":
        case "L":
          // Toggle like for current song
          if (currentSong) toggleLike(currentSong.id);
          break;
        case "s":
        case "S":
          // Quick navigate to library (example)
          navigate("/library");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    togglePlay,
    playNextSong,
    playPrevSong,
    featuredSongs.length,
    currentSong,
    toggleLike,
    navigate
  ]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const slideVariants = {
    enter: { opacity: 0, scale: 1.1 },
    center: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  };

  // Quick stats data - FIXED: Removed Album icon reference
  const quickStats = [
    { label: "Total Songs", value: songs.length, icon: <Music size={16} /> },
    { label: "Liked Songs", value: likedSongs.length, icon: <Heart size={16} /> },
    { label: "Artists", value: artists.length, icon: <Users size={16} /> },
    { label: "Albums", value: albums.length, icon: <Radio size={16} /> } // Changed from Album to Radio
  ];

  // Update the image URL for the second slide of featured tracks
  const featuredTracksImages = [
    "url_to_first_image", // First slide image
    "url_to_second_image", // Update this line with the correct image URL for "Chand Chupa Badal Me"
    "url_to_third_image", // Third slide image
    "url_to_fourth_image" // Fourth slide image
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-auto scrollbar-thin p-4 sm:p-6 md:p-8 pb-44 md:pb-56 max-w-8xl mx-auto w-full">
        
        {/* Enhanced Navbar */}
        <Navbar
          title="Z Music Player"
          subtitle="Discover, stream, and share your favorite music"
          showStats={!searchQuery}
        />

        {/* ⏳ Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1.5, repeat: Infinity }
              }}
              className="text-8xl mb-6"
            >
              🎵
            </motion.div>
            <h3 className="text-3xl font-bold text-white mb-3">
              Loading Your Music World...
            </h3>
            <p className="text-gray-400 text-lg">
              Preparing an amazing musical experience for you
            </p>
          </motion.div>
        )}

        {/* ⚠️ Error State */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect border border-red-500/40 rounded-2xl p-6 mb-6"
          >
            <div className="flex items-start space-x-4">
              <div className="text-2xl">⚠️</div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white mb-2">
                  Connection Issue
                </h3>
                <p className="text-red-300 text-sm mb-4">{error}</p>
                <div className="flex space-x-3">
                  <button 
                    onClick={retryConnection} 
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
                  >
                    <Sparkles size={16} />
                    Retry Connection
                  </button>
                  <button
                    onClick={() => window.open(`${API_BASE}/health`, "_blank")}
                    className="bg-white/10 text-white px-4 py-2 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                  >
                    Check Server Health
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 🏠 Main Content - Only show when not loading and no error */}
        {!loading && !error && !searchQuery && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-12"
          >
            {/* 🎪 Enhanced Featured Hero Section */}
            {featuredSongs.length > 0 && (
              <motion.section variants={itemVariants} className="relative">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                      <Star className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        Featured Tracks
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Curated picks just for you
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      {featuredSongs.slice(0, 4).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            currentSlide === index 
                              ? 'bg-purple-500 w-8' 
                              : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative h-72 sm:h-96 md:h-[480px] rounded-3xl overflow-hidden">
                  <AnimatePresence mode="wait">
                    {featuredSongs.slice(0, 4).map((song, index) => (
                      currentSlide === index && (
                        <motion.div
                          key={getUniqueKey(song, index)}
                          variants={slideVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.7 }}
                          className="absolute inset-0 flex items-end bg-cover bg-center"
                          style={{
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${song.image})`
                          }}
                        >
                          <div className="p-6 sm:p-8 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                              <div className="flex-1">
                                <motion.h3 
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                  className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3"
                                >
                                  {song.title}
                                </motion.h3>
                                <motion.p 
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.3 }}
                                  className="text-gray-300 text-lg sm:text-xl"
                                >
                                  {song.artist} • {song.album}
                                </motion.p>
                                <motion.p 
                                  initial={{ y: 20, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.4 }}
                                  className="text-gray-400 text-sm mt-2"
                                >
                                  {song.duration} • {likedSongs.includes(song.id) ? '❤️ Liked' : 'Click to like'}
                                </motion.p>
                              </div>
                              <div className="flex items-center gap-3">
                                <motion.button
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.5 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleLike(song.id, { stopPropagation: () => {} })}
                                  className={`p-3 rounded-full ${
                                    isLiked(song.id)
                                      ? "text-pink-500 bg-pink-500/20"
                                      : "text-white bg-white/20 hover:bg-white/30"
                                  }`}
                                >
                                  <Heart 
                                    size={20} 
                                    className={isLiked(song.id) ? "fill-current" : ""} 
                                  />
                                </motion.button>
                                <motion.button
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ delay: 0.6 }}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleSongPlay(song, index)}
                                  className="bg-white text-purple-600 p-4 sm:p-5 rounded-full hover:scale-105 transition-transform shadow-2xl"
                                >
                                  {currentSong?.id === song.id && isPlaying ? (
                                    <Pause size={28} />
                                  ) : (
                                    <Play size={28} />
                                  )}
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    ))}
                  </AnimatePresence>
                </div>
              </motion.section>
            )}

            {/* 📊 Quick Stats Bar */}
            {showQuickStats && (
              <motion.section variants={itemVariants}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickStats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="glass-effect rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</p>
                          <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                        </div>
                        <div className="text-purple-400">
                          {stat.icon}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}

            {/* 🎵 Quick Actions Bar */}
            <motion.section variants={itemVariants}>
              <div className="glass-effect rounded-2xl p-6 border border-white/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">Quick Actions</h3>
                    <p className="text-gray-400 text-sm">Manage your music library</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlayAll(songs)}
                      className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors font-medium"
                    >
                      <Play size={18} fill="currentColor" />
                      Play All
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleShufflePlay(songs)}
                      className="bg-white/10 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20"
                    >
                      <Shuffle size={18} />
                      Shuffle
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate("/library")}
                      className="bg-white/5 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors border border-white/10"
                    >
                      <Library size={18} />
                      Library
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* 📈 Enhanced Trending Now Section */}
            {trendingSongs.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                      <TrendingUp className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        Trending Now
                      </h2>
                      <p className="text-gray-400 text-sm">
                        What's hot in your library
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === "grid" 
                            ? "bg-purple-600 text-white" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <Grid3X3 size={18} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === "list" 
                            ? "bg-purple-600 text-white" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <List size={18} />
                      </motion.button>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, x: 4 }}
                      onClick={() => navigate("/library")}
                      className="hidden sm:flex items-center space-x-2 px-6 py-3 glass-effect rounded-xl text-white border border-white/10 hover:border-white/20 transition-all"
                    >
                      <span>View All</span>
                      <ArrowRight size={16} />
                    </motion.button>
                  </div>
                </div>

                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {trendingSongs.slice(0, 4).map((song, index) => (
                      <motion.div
                        key={getUniqueKey(song, index)}
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="glass-effect rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer group relative"
                        onClick={() => handleSongPlay(song, index)}
                      >
                        <div className="relative mb-4">
                          <img
                            src={song.image}
                            alt={song.title}
                            className="w-full aspect-square rounded-xl object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-xl flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {currentSong?.id === song.id && isPlaying ? (
                                <Pause size={24} className="text-white" />
                              ) : (
                                <Play size={24} className="text-white" />
                              )}
                            </div>
                          </div>
                          {currentSong?.id === song.id && isPlaying && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate text-sm">
                            {song.title}
                          </h3>
                          <p className="text-gray-400 text-xs truncate">
                            {song.artist}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-gray-500 text-xs">
                              {song.album}
                            </p>
                            <motion.button
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => handleLike(song.id, e)}
                              className={`p-1 rounded-full ${
                                isLiked(song.id)
                                  ? "text-pink-500 bg-pink-500/20"
                                  : "text-gray-400 hover:text-white hover:bg-white/10"
                              }`}
                            >
                              <Heart 
                                size={14} 
                                className={isLiked(song.id) ? "fill-current" : ""} 
                              />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-effect rounded-2xl border border-white/10 overflow-hidden">
                    {trendingSongs.slice(0, 8).map((song, index) => (
                      <motion.div
                        key={getUniqueKey(song, index)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-4 p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors group ${
                          currentSong?.id === song.id ? 'bg-purple-600/20' : ''
                        }`}
                        onClick={() => handleSongPlay(song, index)}
                      >
                        <div className="w-10 h-10 flex items-center justify-center">
                          {currentSong?.id === song.id && isPlaying ? (
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                          ) : (
                            <Play size={16} className="text-gray-400 group-hover:text-white" />
                          )}
                        </div>
                        <img
                          src={song.image}
                          alt={song.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium truncate ${
                            currentSong?.id === song.id ? 'text-purple-400' : 'text-white'
                          }`}>
                            {song.title}
                          </h4>
                          <p className="text-gray-400 text-sm truncate">
                            {song.artist}
                          </p>
                        </div>
                        <div className="hidden md:block flex-1 min-w-0">
                          <p className="text-gray-400 text-sm truncate">
                            {song.album}
                          </p>
                        </div>
                        <div className="text-gray-400 text-sm">
                          {song.duration}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleLike(song.id, e)}
                          className={`p-2 rounded-full ${
                            isLiked(song.id)
                              ? "text-pink-500"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          <Heart 
                            size={16} 
                            className={isLiked(song.id) ? "fill-current" : ""} 
                          />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.section>
            )}

            {/* 🎤 Enhanced Top Artists */}
            {artists.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                      <Users className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        Top Artists
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Your most played creators
                      </p>
                    </div>
                  </div>
                </div>

                {!selectedArtist ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {artists.map((artist, index) => (
                      <motion.div
                        key={`${artist.name}-${index}`}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="flex flex-col items-center text-center cursor-pointer group"
                        onClick={() => setSelectedArtist(artist.name)}
                      >
                        <div className="relative mb-3">
                          <img
                            src={artist.image}
                            alt={artist.name}
                            className="w-20 h-20 rounded-full object-cover border-2 border-white/20 group-hover:border-purple-500 transition-all shadow-lg"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                            <Music size={12} className="text-white" />
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <h3 className="text-white font-semibold text-sm truncate w-full">
                          {artist.name}
                        </h3>
                        <p className="text-gray-400 text-xs">
                          {artist.songCount} songs • {artist.totalLikes} likes
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    key="artist-songs"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="mt-2"
                  >
                    <div className="flex items-center mb-6">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setSelectedArtist(null)}
                        className="flex items-center text-gray-400 hover:text-white transition-colors mr-4 glass-effect rounded-xl p-2 border border-white/10"
                      >
                        <ChevronLeft size={20} />
                        <span className="ml-1 text-sm">Back to Artists</span>
                      </motion.button>
                      <h3 className="text-xl font-semibold text-white">
                        {selectedArtist}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {getSongsByArtist(selectedArtist).map((song, index) => (
                        <SongCard
                          key={getUniqueKey(song, index)}
                          song={song}
                          index={index}
                          showAlbum
                          onClick={() => handleSongPlay(song, index)}
                          isPlaying={currentSong?.id === song.id && isPlaying}
                          onLike={(e) => handleLike(song.id, e)}
                          isLiked={isLiked(song.id)}
                          variant="enhanced"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.section>
            )}

            {/* 💿 Enhanced Popular Albums */}
            {albums.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                      <Radio className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        Popular Albums
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Complete collections to explore
                      </p>
                    </div>
                  </div>
                </div>

                {!selectedAlbum ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {albums.map((album, index) => (
                      <motion.div
                        key={`${album.name}-${index}`}
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="flex flex-col cursor-pointer group"
                        onClick={() => setSelectedAlbum(album.name)}
                      >
                        <div className="relative mb-3">
                          <img
                            src={album.image}
                            alt={album.name}
                            className="w-full aspect-square rounded-2xl object-cover shadow-lg group-hover:shadow-xl transition-all"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-2xl flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play size={32} className="text-white" />
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/70 rounded-full px-2 py-1">
                            <span className="text-white text-xs font-medium">{album.songCount}</span>
                          </div>
                        </div>
                        <h3 className="text-white font-semibold text-sm truncate">
                          {album.name}
                        </h3>
                        <p className="text-gray-400 text-xs truncate">
                          {album.artist}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {album.totalLikes} likes • {album.songCount} tracks
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="mb-6">
                      <button
                        onClick={() => setSelectedAlbum(null)}
                        className="text-white flex items-center gap-2 hover:text-purple-400 transition-colors glass-effect rounded-xl p-3 border border-white/10"
                      >
                        <ArrowRight className="rotate-180" size={16} />
                        Back to Albums
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {getSongsByAlbum(selectedAlbum).map((song, index) => (
                        <SongCard
                          key={getUniqueKey(song, index)}
                          song={song}
                          index={index}
                          showArtist
                          onClick={() => handleSongPlay(song, index)}
                          isPlaying={currentSong?.id === song.id && isPlaying}
                          onLike={(e) => handleLike(song.id, e)}
                          isLiked={isLiked(song.id)}
                          variant="enhanced"
                        />
                      ))}
                    </div>
                  </>
                )}
              </motion.section>
            )}

            {/* 🆕 Enhanced Recently Added */}
            {recentSongs.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold text-white">
                        Recently Added
                      </h2>
                      <p className="text-gray-400 text-sm">
                        Fresh tracks in your library
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recentSongs.map((song, index) => (
                    <motion.div
                      key={getUniqueKey(song, index)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="glass-effect rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                      onClick={() => handleSongPlay(song, index)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={song.image}
                            alt={song.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {currentSong?.id === song.id && isPlaying ? (
                                <Pause size={16} className="text-white" />
                              ) : (
                                <Play size={16} className="text-white" />
                              )}
                            </div>
                          </div>
                          {currentSong?.id === song.id && isPlaying && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold truncate">
                            {song.title}
                          </h3>
                          <p className="text-gray-400 text-sm truncate">
                            {song.artist} • {song.album}
                          </p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleLike(song.id, e)}
                          className={`p-2 rounded-full ${
                            isLiked(song.id)
                              ? "text-pink-500 bg-pink-500/20"
                              : "text-gray-400 hover:text-white hover:bg-white/10"
                          }`}
                        >
                          <Heart 
                            size={14} 
                            className={isLiked(song.id) ? "fill-current" : ""} 
                          />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            )}
          </motion.div>
        )}

        {/* 🔍 Enhanced Search Results Section */}
        {!loading && searchQuery && (
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1"
          >
            <div className="glass-effect rounded-2xl p-6 border border-white/10 mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Search Results for "{searchQuery}"
              </h2>
              <p className="text-gray-400">
                Found {filteredSongs.length} song{filteredSongs.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <AnimatePresence mode="wait">
              {filteredSongs.length ? (
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                >
                  {filteredSongs.map((song, index) => (
                    <div key={getUniqueKey(song, index)} onClick={() => handleSongPlay(song, index)}>
                      <SongCard
                        song={song}
                        index={index}
                        highlightQuery={searchQuery}
                        isCurrentlyPlaying={currentSong?.id === song.id && isPlaying}
                        variant="enhanced"
                      />
                    </div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center glass-effect rounded-2xl border border-white/10"
                >
                  <div className="text-7xl mb-4">🔍</div>
                  <h3 className="text-xl text-white mb-2">No songs found</h3>
                  <p className="text-gray-400">
                    Try searching with different keywords.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Spacer to ensure content isn't hidden behind the fixed player */}
            <div className="pointer-events-none h-28 md:h-36 lg:h-44" />
          </motion.section>
        )}
      </div>
    </motion.div>
  );
};

export default Home;