import React, { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Music, 
  User, 
  Album, 
  Clock, 
  TrendingUp, 
  Heart,
  Play,
  Shuffle,
  Filter,
  X,
  Star,
  Mic2,
  Disc3,
  ArrowRight,
  History,
  Sparkles
} from "lucide-react";
import SongCard from "../components/SongCard";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import { useMusicPlayer } from "../context/MusicPlayerContext";

const SearchPage = () => {
  const { 
    filteredSongs = [], 
    searchQuery = "", 
    songs = [], 
    setSearchQuery,
    currentSong,
    isPlaying,
    playSong,
    toggleLike,
    likedSongs
  } = useMusicPlayer();

  const [searchFilter, setSearchFilter] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [viewMode, setViewMode] = useState("grid");

  // 🔧 Helper Functions - MOVED BEFORE useMemo HOOKS
  const getRelevanceScore = (song, query) => {
    const q = query.toLowerCase();
    let score = 0;
    
    if (song.title?.toLowerCase().includes(q)) score += 3;
    if (song.artist?.toLowerCase().includes(q)) score += 2;
    if (song.album?.toLowerCase().includes(q)) score += 1;
    if (likedSongs.includes(song.id)) score += 1;
    
    return score;
  };

  const getImageUrl = (img, fallbackSeed = "default") => {
    if (!img) return `https://picsum.photos/seed/${fallbackSeed}/200/200`;
    if (img.startsWith("http")) return img;
    const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return img.startsWith("/") ? `${API_BASE}${img}` : `${API_BASE}/${img}`;
  };

  // 📊 Enhanced Search Statistics
  const searchStats = useMemo(() => {
    if (!searchQuery) return null;
    
    const artists = new Map();
    const albums = new Map();
    let totalDuration = 0;
    let totalLikes = 0;

    filteredSongs.forEach((song) => {
      // Count artists
      if (song.artist) {
        artists.set(song.artist, (artists.get(song.artist) || 0) + 1);
      }
      
      // Count albums
      if (song.album) {
        albums.set(song.album, (albums.get(song.album) || 0) + 1);
      }
      
      // Calculate duration
      if (song.duration) {
        const [min, sec] = song.duration.split(':').map(Number);
        totalDuration += (min * 60) + sec;
      }
      
      // Count likes
      if (likedSongs.includes(song.id)) {
        totalLikes++;
      }
    });

    const duration = totalDuration;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);

    return {
      songs: filteredSongs.length,
      artists: artists.size,
      albums: albums.size,
      duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
      likes: totalLikes,
      topArtist: [...artists.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    };
  }, [filteredSongs, searchQuery, likedSongs]);

  // 🔎 Enhanced Filter Results
  const filteredResults = useMemo(() => {
    if (!searchQuery) return [];
    
    let results = [...filteredSongs];
    
    // Apply type filter
    if (searchFilter !== "all") {
      const query = searchQuery.toLowerCase();
      results = results.filter((song) => {
        switch (searchFilter) {
          case "songs":
            return song.title?.toLowerCase().includes(query);
          case "artists":
            return song.artist?.toLowerCase().includes(query);
          case "albums":
            return song.album?.toLowerCase().includes(query);
          case "liked":
            return likedSongs.includes(song.id);
          default:
            return true;
        }
      });
    }

    // Apply sorting
    results.sort((a, b) => {
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
        case "popular":
          return (likedSongs.includes(b.id) ? 1 : 0) - (likedSongs.includes(a.id) ? 1 : 0);
        case "relevance":
        default:
          // Basic relevance scoring - NOW getRelevanceScore IS DEFINED
          const aScore = getRelevanceScore(a, searchQuery);
          const bScore = getRelevanceScore(b, searchQuery);
          return bScore - aScore;
      }
    });

    return results;
  }, [filteredSongs, searchQuery, searchFilter, sortBy, likedSongs, getRelevanceScore]);

  // 🌟 Enhanced Popular Searches with Images
  const popularSearches = useMemo(() => {
    const artistMap = new Map();
    const albumMap = new Map();

    songs.forEach(song => {
      if (song.artist) {
        if (!artistMap.has(song.artist)) {
          artistMap.set(song.artist, {
            name: song.artist,
            songCount: 0,
            image: song.image,
            likes: 0
          });
        }
        const artist = artistMap.get(song.artist);
        artist.songCount++;
        if (likedSongs.includes(song.id)) artist.likes++;
      }

      if (song.album) {
        if (!albumMap.has(song.album)) {
          albumMap.set(song.album, {
            name: song.album,
            artist: song.artist,
            songCount: 0,
            image: song.image,
            likes: 0
          });
        }
        const album = albumMap.get(song.album);
        album.songCount++;
        if (likedSongs.includes(song.id)) album.likes++;
      }
    });

    const artists = Array.from(artistMap.values())
      .sort((a, b) => b.songCount - a.songCount)
      .slice(0, 6);

    const albums = Array.from(albumMap.values())
      .sort((a, b) => b.songCount - a.songCount)
      .slice(0, 6);

    return { artists, albums };
  }, [songs, likedSongs]);

  // 💾 Modified Recent Searches Management - Add cleanup
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
    
    // Cleanup function to save state when unmounting
    return () => {
      if (searchQuery) {
        addToRecentSearches(searchQuery);
      }
    };
  }, []);

  const addToRecentSearches = (query) => {
    if (!query?.trim()) return;
    
    const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  // 🎯 Modified Quick Search - Remove any blocking behavior
  const handleQuickSearch = (term) => {
    setSearchQuery(term);
    // Only add to recent searches if there's a term
    if (term) {
      addToRecentSearches(term);
    }
  };

  // 🎵 Modified Player Actions - Remove setIsPlaying references
  const handlePlayAll = () => {
    if (filteredResults.length > 0) {
      playSong(filteredResults[0]);
    }
  };

  const handleShufflePlay = () => {
    if (filteredResults.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredResults.length);
      playSong(filteredResults[randomIndex]);
    }
  };

  // 🎬 Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
  };

  const slideVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin p-4 sm:p-6 md:p-8 pb-[calc(40vh+2rem)] max-w-8xl mx-auto w-full">
        
        {/* Enhanced Navbar */}
        <Navbar
          title="Search Music"
          subtitle="Discover songs, artists, and albums in your library"
          showSearch={false}
        />

        {/* 🔍 Enhanced Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="glass-effect rounded-2xl p-1 border border-white/10">
            <SearchBar />
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {/* 💬 Empty Search State */}
          {!searchQuery ? (
            <motion.div
              key="empty-search"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex-1 flex flex-col"
            >
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <motion.section
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  className="mb-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                      <History size={20} />
                      Recent Searches
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={clearRecentSearches}
                      className="text-gray-400 hover:text-white text-sm flex items-center gap-1"
                    >
                      <X size={14} />
                      Clear
                    </motion.button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <motion.button
                        key={search}
                        variants={slideVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickSearch(search)}
                        className="glass-effect px-4 py-2 rounded-xl text-white hover:bg-white/10 transition-all duration-300 border border-white/10 flex items-center gap-2"
                      >
                        <Clock size={14} />
                        {search}
                      </motion.button>
                    ))}
                  </div>
                </motion.section>
              )}

              {/* Popular Artists */}
              <motion.section
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mb-8"
              >
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Mic2 size={20} />
                  Popular Artists
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                  {popularSearches.artists.map((artist, i) => (
                    <motion.button
                      key={artist.name}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickSearch(artist.name)}
                      className="glass-effect p-3 sm:p-4 rounded-xl text-center hover:bg-white/10 transition-all duration-300 border border-white/10 group"
                    >
                      <div className="relative mb-2 sm:mb-3">
                        <img
                          src={getImageUrl(artist.image, artist.name)}
                          alt={artist.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full object-cover border-2 border-white/20 group-hover:border-purple-500 transition-all"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <Music size={10} className="text-white" />
                        </div>
                      </div>
                      <p className="text-white text-xs sm:text-sm font-medium truncate mb-1">
                        {artist.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {artist.songCount} songs
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.section>

              {/* Popular Albums */}
              <motion.section
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="mb-8"
              >
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Disc3 size={20} />
                  Popular Albums
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
                  {popularSearches.albums.map((album, i) => (
                    <motion.button
                      key={album.name}
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleQuickSearch(album.name)}
                      className="glass-effect p-3 sm:p-4 rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/10 group text-left"
                    >
                      <div className="relative mb-2 sm:mb-3">
                        <img
                          src={getImageUrl(album.image, album.name)}
                          alt={album.name}
                          className="w-full aspect-square rounded-lg object-cover group-hover:shadow-xl transition-all"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all rounded-lg flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play size={20} className="text-white" />
                          </div>
                        </div>
                      </div>
                      <p className="text-white text-xs sm:text-sm font-medium truncate">
                        {album.name}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {album.artist}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {album.songCount} tracks
                      </p>
                    </motion.button>
                  ))}
                </div>
              </motion.section>

              {/* 💡 Enhanced Search Tips */}
              <motion.section
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="glass-effect rounded-2xl p-6 border border-white/10"
              >
                <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                  <Sparkles size={20} />
                  Search Tips & Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                    <div className="text-purple-400 mt-1">
                      <Search size={18} />
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">
                        Smart Search
                      </p>
                      <p className="text-gray-400 text-xs">
                        Search by title, artist, album, or any combination
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                    <div className="text-pink-400 mt-1">
                      <Filter size={18} />
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">
                        Advanced Filters
                      </p>
                      <p className="text-gray-400 text-xs">
                        Filter by songs, artists, albums, or liked tracks
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-white/5">
                    <div className="text-blue-400 mt-1">
                      <TrendingUp size={18} />
                    </div>
                    <div>
                      <p className="text-white font-medium mb-1">
                        Quick Access
                      </p>
                      <p className="text-gray-400 text-xs">
                        Click on popular artists or albums for instant results
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>
            </motion.div>
          ) : filteredResults.length === 0 ? (
            // 😔 No Results State
            <motion.div
              key="no-results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center py-16 text-center"
            >
              <div className="text-7xl mb-6">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No results found for "{searchQuery}"
              </h3>
              <p className="text-gray-400 text-lg mb-6 max-w-md">
                Try searching with different keywords or check the spelling.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSearchQuery("")}
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors"
                >
                  <X size={18} />
                  Clear Search
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="bg-white/10 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20"
                >
                  <Filter size={18} />
                  Adjust Filters
                </motion.button>
              </div>
            </motion.div>
          ) : (
            // ✅ Enhanced Search Results
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              {/* Enhanced Header with Stats + Controls */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="glass-effect rounded-2xl p-4 sm:p-6 border border-white/10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-xl mb-2">
                        Results for "{searchQuery}"
                      </h3>
                      {searchStats && (
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Music size={14} />
                            {searchStats.songs} songs
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={14} />
                            {searchStats.artists} artists
                          </span>
                          <span className="flex items-center gap-1">
                            <Album size={14} />
                            {searchStats.albums} albums
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {searchStats.duration}
                          </span>
                          {searchStats.topArtist && (
                            <span className="flex items-center gap-1">
                              <Star size={14} />
                              Top: {searchStats.topArtist}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePlayAll}
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors text-sm"
                      >
                        <Play size={16} fill="currentColor" />
                        Play All
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShufflePlay}
                        className="bg-white/10 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20 text-sm"
                      >
                        <Shuffle size={16} />
                        Shuffle
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFilters(!showFilters)}
                        className="bg-white/5 text-white p-2 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
                      >
                        <Filter size={16} />
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
                        className="pt-4 border-t border-white/10 overflow-hidden"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Category Filters */}
                          <div>
                            <label className="text-white text-sm font-medium mb-2 block">
                              Filter by Type
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {[
                                { key: "all", label: "All", icon: <Music size={14} /> },
                                { key: "songs", label: "Songs", icon: <Music size={14} /> },
                                { key: "artists", label: "Artists", icon: <User size={14} /> },
                                { key: "albums", label: "Albums", icon: <Album size={14} /> },
                                { key: "liked", label: "Liked", icon: <Heart size={14} /> }
                              ].map((filter) => (
                                <motion.button
                                  key={filter.key}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setSearchFilter(filter.key)}
                                  className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all ${
                                    searchFilter === filter.key
                                      ? "bg-purple-600 text-white shadow-lg"
                                      : "glass-effect text-gray-300 hover:text-white hover:bg-white/10"
                                  }`}
                                >
                                  {filter.icon}
                                  {filter.label}
                                </motion.button>
                              ))}
                            </div>
                          </div>

                          {/* Sort Options */}
                          <div>
                            <label className="text-white text-sm font-medium mb-2 block">
                              Sort by
                            </label>
                            <select
                              value={sortBy}
                              onChange={(e) => setSortBy(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                              <option value="relevance">Relevance</option>
                              <option value="title">Title</option>
                              <option value="artist">Artist</option>
                              <option value="album">Album</option>
                              <option value="duration">Duration</option>
                              <option value="popular">Most Popular</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.section>

              {/* Enhanced Results Grid */}
              <motion.section
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1"
              >
                <motion.div
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
                >
                  {filteredResults.map((song, index) => (
                    <SongCard
                      key={song.id}
                      song={song}
                      index={index}
                      highlightQuery={searchQuery}
                      isCurrentlyPlaying={currentSong?.id === song.id && isPlaying}
                      variant="enhanced"
                      showLikes
                    />
                  ))}
                </motion.div>

                {/* Enhanced End of Results */}
                {filteredResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center py-8 mt-4 glass-effect rounded-2xl border border-white/10"
                  >
                    <p className="text-gray-400 text-sm mb-2">
                      🎉 Found {filteredResults.length} matching song
                      {filteredResults.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-gray-500 text-xs">
                      That's all we found for "{searchQuery}"
                    </p>
                  </motion.div>
                )}
              </motion.section>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default SearchPage;