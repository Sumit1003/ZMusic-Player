import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Heart, 
  Play, 
  Pause, 
  Shuffle, 
  Clock, 
  Music, 
  User, 
  Album, 
  Trash2,
  Download,
  Share2,
  MoreHorizontal,
  Grid3X3,
  List,
  Filter,
  Search,
  ArrowUp,
  ArrowDown,
  SkipForward,
  SkipBack,
  Volume2,
  Repeat,
  Sparkles,
  Crown,
  Trophy,
  Star
} from "lucide-react";
import SongCard from "../components/SongCard";
import Navbar from "../components/Navbar";
import { useMusicPlayer } from "../context/MusicPlayerContext";

const LikedSongs = () => {
  const { 
    filteredSongs, 
    likedSongs, 
    playSong, 
    currentSong, 
    isPlaying, 
    togglePlay,
    toggleLike,
    setSearchQuery
  } = useMusicPlayer();
  
  const navigate = useNavigate();
  
  // State management
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [selectedSongs, setSelectedSongs] = useState(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [keyboardIndex, setKeyboardIndex] = useState(-1);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // 🎵 Get liked songs with enhanced filtering and sorting
  const likedSongsList = useMemo(() => {
    let songs = filteredSongs.filter((song) => likedSongs.includes(song.id));
    
    // Apply search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      songs = songs.filter(song => 
        song.title?.toLowerCase().includes(query) ||
        song.artist?.toLowerCase().includes(query) ||
        song.album?.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    songs.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title?.localeCompare(b.title);
        case "artist":
          return a.artist?.localeCompare(b.artist);
        case "album":
          return a.album?.localeCompare(b.album);
        case "duration":
          const aDur = a.duration ? a.duration.split(':').map(Number) : [0, 0];
          const bDur = b.duration ? b.duration.split(':').map(Number) : [0, 0];
          return (aDur[0] * 60 + aDur[1]) - (bDur[0] * 60 + bDur[1]);
        case "recent":
        default:
          return likedSongs.indexOf(b.id) - likedSongs.indexOf(a.id);
      }
    });
    
    return songs;
  }, [filteredSongs, likedSongs, searchTerm, sortBy]);

  // 🧮 Enhanced Statistics
  const stats = useMemo(() => {
    const totalDuration = likedSongsList.reduce((total, song) => {
      if (!song.duration) return total;
      const [min, sec] = song.duration.split(":").map(Number);
      return total + (min * 60 + sec || 0);
    }, 0);

    const artistMap = new Map();
    const albumMap = new Map();
    
    likedSongsList.forEach(song => {
      // Count artists
      if (song.artist) {
        artistMap.set(song.artist, (artistMap.get(song.artist) || 0) + 1);
      }
      // Count albums
      if (song.album) {
        albumMap.set(song.album, (albumMap.get(song.album) || 0) + 1);
      }
    });

    const topArtist = [...artistMap.entries()].sort((a, b) => b[1] - a[1])[0];
    const topAlbum = [...albumMap.entries()].sort((a, b) => b[1] - a[1])[0];

    return {
      totalSongs: likedSongsList.length,
      totalArtists: artistMap.size,
      totalAlbums: albumMap.size,
      totalDuration,
      topArtist: topArtist ? { name: topArtist[0], count: topArtist[1] } : null,
      topAlbum: topAlbum ? { name: topAlbum[0], count: topAlbum[1] } : null,
      completion: likedSongsList.length > 0 ? Math.round((likedSongsList.length / filteredSongs.length) * 100) : 0
    };
  }, [likedSongsList, filteredSongs.length]);

  const formatDuration = (seconds) => {
    if (!seconds) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // 🎧 Player Actions
  const handleSongPlay = useCallback((song, index) => {
    if (currentSong?.id === song.id) {
      togglePlay();
    } else {
      playSong(song, index);
    }
  }, [currentSong, togglePlay, playSong]);

  const handlePlayAll = useCallback(() => {
    if (likedSongsList.length > 0) {
      playSong(likedSongsList[0], 0);
    }
  }, [likedSongsList, playSong]);

  const handleShufflePlay = useCallback(() => {
    if (likedSongsList.length > 0) {
      const randomIndex = Math.floor(Math.random() * likedSongsList.length);
      playSong(likedSongsList[randomIndex], randomIndex);
    }
  }, [likedSongsList, playSong]);

  // 🎹 Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setKeyboardIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setKeyboardIndex(prev => Math.min(likedSongsList.length - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (keyboardIndex >= 0 && keyboardIndex < likedSongsList.length) {
            handleSongPlay(likedSongsList[keyboardIndex], keyboardIndex);
          }
          break;
        case ' ':
          e.preventDefault();
          if (currentSong) togglePlay();
          break;
        case 's':
        case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setSearchTerm(prev => {
              const input = document.querySelector('input[type="text"]');
              if (input) input.focus();
              return prev;
            });
          }
          break;
        case 'Escape':
          setKeyboardIndex(-1);
          setIsSelectionMode(false);
          setSelectedSongs(new Set());
          break;
        case 'a':
        case 'A':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setIsSelectionMode(true);
            setSelectedSongs(new Set(likedSongsList.map(song => song.id)));
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyboardIndex, likedSongsList, handleSongPlay, currentSong, togglePlay]);

  // 🎯 Selection Management
  const toggleSongSelection = (songId) => {
    const newSelection = new Set(selectedSongs);
    if (newSelection.has(songId)) {
      newSelection.delete(songId);
    } else {
      newSelection.add(songId);
    }
    setSelectedSongs(newSelection);
    setIsSelectionMode(newSelection.size > 0);
  };

  const clearSelection = () => {
    setSelectedSongs(new Set());
    setIsSelectionMode(false);
  };

  const removeSelectedSongs = () => {
    selectedSongs.forEach(songId => {
      toggleLike(songId);
    });
    clearSelection();
  };

  // 🎨 Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: "backOut" }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin p-4 sm:p-6 md:p-8 pb-40 max-w-8xl mx-auto w-full">
        
        {/* Enhanced Navbar */}
        <Navbar
          title="Liked Songs"
          subtitle={`${likedSongsList.length} song${likedSongsList.length !== 1 ? 's' : ''} • Your personal favorites`}
          showSearch={false}
        />

        <AnimatePresence mode="wait">
          {/* 💔 No liked songs */}
          {likedSongs.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-16"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, -10, 10, 0],
                }}
                transition={{
                  scale: { duration: 2, repeat: Infinity },
                  rotate: { duration: 3, repeat: Infinity },
                }}
                className="text-8xl mb-6"
              >
                💔
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No Liked Songs Yet
              </h3>
              <p className="text-gray-400 text-lg mb-8 max-w-md">
                Start building your collection by clicking the ❤️ icon on any song.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/library")}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors"
                >
                  <Music size={18} />
                  Browse Library
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="bg-white/10 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20"
                >
                  <Sparkles size={18} />
                  Discover Music
                </motion.button>
              </div>
            </motion.div>
          ) : likedSongsList.length === 0 ? (
            // 🔍 No results from search/filter
            <motion.div
              key="search-empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-16"
            >
              <div className="text-7xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No Matching Liked Songs
              </h3>
              <p className="text-gray-400 text-lg mb-6 max-w-md">
                Try adjusting your search or filters to see your {likedSongs.length} liked songs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchTerm("")}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors"
                >
                  Clear Search
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(true)}
                  className="bg-white/10 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20"
                >
                  <Filter size={18} />
                  Adjust Filters
                </motion.button>
              </div>
            </motion.div>
          ) : (
            // ✅ Enhanced Liked Songs Content
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* 🎛️ Enhanced Control Bar */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl p-4 sm:p-6 mb-6 border border-white/10"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left Controls */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePlayAll}
                      className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors font-medium"
                    >
                      <Play size={18} fill="currentColor" />
                      Play All
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShufflePlay}
                      className="bg-white/10 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20"
                    >
                      <Shuffle size={18} />
                      Shuffle
                    </motion.button>

                    {isSelectionMode && (
                      <>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={removeSelectedSongs}
                          className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 hover:bg-red-700 transition-colors"
                        >
                          <Trash2 size={18} />
                          Remove ({selectedSongs.size})
                        </motion.button>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={clearSelection}
                          className="bg-white/5 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors border border-white/10"
                        >
                          Cancel
                        </motion.button>
                      </>
                    )}
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder="Search liked songs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-40 sm:w-48"
                      />
                    </div>

                    {/* View Toggle */}
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
                        <Grid3X3 size={16} />
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
                        <List size={16} />
                      </motion.button>
                    </div>

                    {/* Filter Toggle */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-3 rounded-xl transition-colors border ${
                        showFilters 
                          ? "bg-purple-600 border-purple-500 text-white" 
                          : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      <Filter size={18} />
                    </motion.button>
                  </div>
                </div>

                {/* Enhanced Filters Panel */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">
                            Sort By
                          </label>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            <option value="recent">Most Recent</option>
                            <option value="title">Title (A-Z)</option>
                            <option value="artist">Artist (A-Z)</option>
                            <option value="album">Album (A-Z)</option>
                            <option value="duration">Duration</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="text-white text-sm font-medium mb-2 block">
                            Quick Stats
                          </label>
                          <div className="flex items-center justify-between text-sm text-gray-400 bg-white/5 rounded-xl px-4 py-2 border border-white/10">
                            <span>{likedSongsList.length} songs</span>
                            <span>•</span>
                            <span>{formatDuration(stats.totalDuration)}</span>
                            <span>•</span>
                            <span>{stats.completion}% of library</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>

              {/* 🏆 Enhanced Statistics Section */}
              <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="mb-8"
              >
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Trophy size={20} />
                  Your Music Collection
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[
                    { 
                      label: "Liked Songs", 
                      value: stats.totalSongs, 
                      icon: <Heart size={20} className="text-pink-500" />,
                      description: "Your favorites"
                    },
                    { 
                      label: "Artists", 
                      value: stats.totalArtists, 
                      icon: <User size={20} className="text-blue-500" />,
                      description: "Unique artists"
                    },
                    { 
                      label: "Albums", 
                      value: stats.totalAlbums, 
                      icon: <Album size={20} className="text-green-500" />,
                      description: "Different albums"
                    },
                    { 
                      label: "Play Time", 
                      value: formatDuration(stats.totalDuration), 
                      icon: <Clock size={20} className="text-purple-500" />,
                      description: "Total duration"
                    }
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      variants={statCardVariants}
                      whileHover="hover"
                      className="glass-effect rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-2xl font-bold text-white">
                          {stat.value}
                        </div>
                        {stat.icon}
                      </div>
                      <div className="text-white font-medium text-sm mb-1">
                        {stat.label}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {stat.description}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Top Artist & Album */}
                {(stats.topArtist || stats.topAlbum) && (
                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                  >
                    {stats.topArtist && (
                      <div className="glass-effect rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <Crown size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">Top Artist</div>
                            <div className="text-gray-400 text-sm">{stats.topArtist.name}</div>
                            <div className="text-gray-500 text-xs">{stats.topArtist.count} songs</div>
                          </div>
                        </div>
                      </div>
                    )}
                    {stats.topAlbum && (
                      <div className="glass-effect rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <Star size={20} className="text-white" />
                          </div>
                          <div>
                            <div className="text-white font-medium">Top Album</div>
                            <div className="text-gray-400 text-sm">{stats.topAlbum.name}</div>
                            <div className="text-gray-500 text-xs">{stats.topAlbum.count} songs</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.section>

              {/* 🎵 Enhanced Songs Display */}
              <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-semibold text-lg">
                    Your Liked Songs
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{likedSongsList.length} songs</span>
                    <span>•</span>
                    <span>{formatDuration(stats.totalDuration)}</span>
                    {isSelectionMode && (
                      <>
                        <span>•</span>
                        <span className="text-purple-400">{selectedSongs.size} selected</span>
                      </>
                    )}
                  </div>
                </div>

                {viewMode === "grid" ? (
                  // 🎵 Grid View
                  <motion.div
                    layout
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
                  >
                    {likedSongsList.map((song, index) => (
                      <div
                        key={song.id}
                        onClick={() => isSelectionMode 
                          ? toggleSongSelection(song.id)
                          : handleSongPlay(song, index)
                        }
                        onMouseEnter={() => setKeyboardIndex(index)}
                        className={`cursor-pointer transition-all ${
                          keyboardIndex === index ? 'ring-2 ring-purple-500' : ''
                        } ${
                          selectedSongs.has(song.id) ? 'ring-2 ring-pink-500' : ''
                        }`}
                      >
                        <SongCard
                          song={song}
                          index={index}
                          showAlbum={true}
                          showLikeButton={false}
                          isCurrentlyPlaying={currentSong?.id === song.id && isPlaying}
                          variant="enhanced"
                          isSelected={selectedSongs.has(song.id)}
                          showSelection={isSelectionMode}
                        />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  // 📋 List View
                  <motion.div
                    layout
                    className="glass-effect rounded-2xl border border-white/10 overflow-hidden"
                  >
                    {likedSongsList.map((song, index) => (
                      <motion.div
                        key={song.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => isSelectionMode 
                          ? toggleSongSelection(song.id)
                          : handleSongPlay(song, index)
                        }
                        onMouseEnter={() => setKeyboardIndex(index)}
                        className={`flex items-center gap-4 p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors group cursor-pointer ${
                          keyboardIndex === index ? 'bg-purple-600/20' : ''
                        } ${
                          selectedSongs.has(song.id) ? 'bg-pink-600/20' : ''
                        } ${
                          currentSong?.id === song.id ? 'bg-purple-600/20' : ''
                        }`}
                      >
                        {/* Selection Checkbox */}
                        {isSelectionMode && (
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            selectedSongs.has(song.id) 
                              ? 'bg-pink-500 border-pink-500' 
                              : 'border-gray-400'
                          }`}>
                            {selectedSongs.has(song.id) && (
                              <div className="w-2 h-2 bg-white rounded-sm" />
                            )}
                          </div>
                        )}

                        {/* Play Button */}
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                          {currentSong?.id === song.id && isPlaying ? (
                            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
                          ) : (
                            <Play size={16} className="text-gray-400 group-hover:text-white" />
                          )}
                        </div>

                        {/* Song Image */}
                        <img
                          src={song.image || `https://picsum.photos/seed/${song.id}/100/100`}
                          alt={song.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                        />

                        {/* Song Info */}
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

                        {/* Album */}
                        <div className="hidden md:block flex-1 min-w-0">
                          <p className="text-gray-400 text-sm truncate">
                            {song.album}
                          </p>
                        </div>

                        {/* Duration */}
                        <div className="text-gray-400 text-sm flex-shrink-0">
                          {song.duration}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(song.id);
                            }}
                            className="p-2 text-pink-500 hover:text-pink-400 rounded-full"
                          >
                            <Heart size={16} className="fill-current" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add a spacer div to ensure content doesn't hide under the player */}
      <div className="h-24 md:h-28" /> {/* Adjust height based on your player height */}
    </motion.div>
  );
};

export default LikedSongs;