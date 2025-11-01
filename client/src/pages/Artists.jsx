import React, { useMemo, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Play, 
  Shuffle,
  Music,
  Album,
  Clock,
  X,
  Loader
} from "lucide-react";
import SongCard from "../components/SongCard";
import Navbar from "../components/Navbar";
import { useMusicPlayer } from "../context/MusicPlayerContext";

const ITEMS_PER_PAGE = 12;

const Artists = () => {
  const { filteredSongs, playSong, currentSong, isPlaying } = useMusicPlayer();
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // 📱 Detect mobile screen
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  /* 🌍 Enhanced Backend URL helper */
  const getBackendUrl = (path, fallbackSeed = "default") => {
    const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
    if (!path) return `https://picsum.photos/seed/${fallbackSeed}/300/300`;
    if (path.startsWith("http")) return path;
    return `${base}/${path.replace(/^\/+/, "")}`;
  };

  /* 🎤 Enhanced Artist categorization with statistics */
  const artists = useMemo(() => {
    const map = {};
    filteredSongs.forEach((song) => {
      if (!song.artist) return;
      
      // Handle multiple artists (comma-separated)
      const artists = song.artist.split(',').map(a => a.trim());
      
      artists.forEach(artistName => {
        if (!artistName) return;
        
        if (!map[artistName]) {
          map[artistName] = {
            songs: [],
            totalDuration: 0,
            albums: new Set(),
            image: song.image
          };
        }
        map[artistName].songs.push(song);
        if (song.album) map[artistName].albums.add(song.album);
        
        // Calculate duration
        if (song.duration) {
          if (typeof song.duration === 'number') {
            map[artistName].totalDuration += song.duration;
          } else if (typeof song.duration === 'string') {
            const [min, sec] = song.duration.split(':').map(Number);
            map[artistName].totalDuration += (min * 60) + (sec || 0);
          }
        }
      });
    });

    let artistList = Object.entries(map).map(([name, data]) => ({
      name,
      count: data.songs.length,
      songs: data.songs,
      image: getBackendUrl(data.image, name),
      albums: data.albums.size,
      duration: data.totalDuration,
      popularity: data.songs.length + (data.albums.size * 2) // Weight albums higher
    }));

    // Apply search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      artistList = artistList.filter(artist => 
        artist.name.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    artistList.sort((a, b) => {
      switch (sortBy) {
        case "songs":
          return b.count - a.count;
        case "albums":
          return b.albums - a.albums;
        case "popular":
          return b.popularity - a.popularity;
        case "duration":
          return b.duration - a.duration;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return artistList;
  }, [filteredSongs, searchTerm, sortBy]);

  /* 🧭 Enhanced Pagination logic */
  const totalPages = Math.ceil(artists.length / ITEMS_PER_PAGE);
  const paginatedArtists = artists.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, artists.length]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentPage(prev => prev + 1);
        setIsLoading(false);
      }, 200);
    }
  }, [currentPage, totalPages]);

  const handlePrev = useCallback(() => {
    if (currentPage > 1) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentPage(prev => prev - 1);
        setIsLoading(false);
      }, 200);
    }
  }, [currentPage]);

  // Handle direct page click
  const handlePageClick = useCallback((pageNum) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPage(pageNum);
      setIsLoading(false);
    }, 200);
  }, []);

  /* 🎵 Player Actions */
  const handlePlayArtist = useCallback((artistSongs, e) => {
    e?.stopPropagation();
    if (artistSongs.length > 0) {
      playSong(artistSongs[0], artistSongs);
    }
  }, [playSong]);

  const handleShuffleArtist = useCallback((artistSongs, e) => {
    e?.stopPropagation();
    if (artistSongs.length > 0) {
      const shuffled = [...artistSongs].sort(() => Math.random() - 0.5);
      playSong(shuffled[0], shuffled);
    }
  }, [playSong]);

  /* 🎬 Enhanced Animation Variants */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03 }
    },
    exit: { opacity: 0, y: 30 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    hover: {
      scale: 1.02,
      y: -2,
      transition: { duration: 0.2 }
    }
  };

  /* 📊 Format duration helper */
  const formatDuration = (seconds) => {
    if (!seconds || seconds === 0) return "0m";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // 🎨 Color themes for artist cards
  const artistColors = [
    "from-purple-500/10 to-pink-500/10",
    "from-blue-500/10 to-cyan-500/10",
    "from-green-500/10 to-emerald-500/10",
    "from-orange-500/10 to-red-500/10",
    "from-indigo-500/10 to-purple-500/10",
  ];

  const getRandomColor = (artistName) => {
    const index = artistName.split("").reduce((a, b) => a + b.charCodeAt(0), 0) % artistColors.length;
    return artistColors[index];
  };

  // Generate pagination range
  const getPaginationRange = () => {
    const delta = isMobile ? 1 : 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
    >
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin p-3 sm:p-4 md:p-6 lg:p-8 pb-20 lg:pb-32 max-w-8xl mx-auto w-full">
        
        {/* Enhanced Navbar */}
        <Navbar
          title={selectedArtist ? selectedArtist : "Artists"}
          subtitle={
            selectedArtist 
              ? `Songs by ${selectedArtist}`
              : `Browse ${artists.length} artists in your library`
          }
          showSearch={false}
        />

        <AnimatePresence mode="wait">
          {!selectedArtist ? (
            // 🎤 Enhanced Artist Grid View
            <motion.div
              key={`artists-page-${currentPage}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex-1 flex flex-col"
            >
              {/* 🎛️ Enhanced Control Bar */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 border border-white/10"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                  {/* Left Controls */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg sm:text-xl mb-1 sm:mb-2 truncate">
                      Music Artists
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">
                      Discover and explore artists in your library
                    </p>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-none min-w-[140px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search artists..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl pl-9 pr-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode("grid")}
                        className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                          viewMode === "grid" 
                            ? "bg-purple-600 text-white" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <Grid3X3 size={14} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode("list")}
                        className={`p-1.5 sm:p-2 rounded-md transition-colors ${
                          viewMode === "list" 
                            ? "bg-purple-600 text-white" 
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <List size={14} />
                      </motion.button>
                    </div>

                    {/* Filter Toggle */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-2 sm:p-3 rounded-lg sm:rounded-xl transition-colors border ${
                        showFilters 
                          ? "bg-purple-600 border-purple-500 text-white" 
                          : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                      }`}
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
                      className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-white/10 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                        <div>
                          <label className="text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">
                            Sort By
                          </label>
                          <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                          >
                            <option value="name">Name (A-Z)</option>
                            <option value="songs">Most Songs</option>
                            <option value="albums">Most Albums</option>
                            <option value="popular">Popularity</option>
                            <option value="duration">Duration</option>
                          </select>
                        </div>
                        
                        <div className="sm:col-span-2 lg:col-span-1">
                          <label className="text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">
                            Quick Stats
                          </label>
                          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400 bg-white/5 rounded-lg sm:rounded-xl px-3 py-2 border border-white/10">
                            <div className="text-center">
                              <div className="text-white font-semibold">{artists.length}</div>
                              <div className="text-xs">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white font-semibold">{paginatedArtists.length}</div>
                              <div className="text-xs">Showing</div>
                            </div>
                          </div>
                        </div>

                        <div className="sm:col-span-2 lg:col-span-1">
                          <label className="text-white text-xs sm:text-sm font-medium mb-1 sm:mb-2 block">
                            View Options
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setViewMode("grid")}
                              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                viewMode === "grid"
                                  ? "bg-purple-600 text-white"
                                  : "bg-white/5 text-gray-400 hover:bg-white/10"
                              }`}
                            >
                              Grid
                            </button>
                            <button
                              onClick={() => setViewMode("list")}
                              className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                                viewMode === "list"
                                  ? "bg-purple-600 text-white"
                                  : "bg-white/5 text-gray-400 hover:bg-white/10"
                              }`}
                            >
                              List
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.section>

              {artists.length === 0 ? (
                // 🎭 Empty State
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4"
                >
                  <div className="text-5xl sm:text-6xl mb-4">🎤</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                    No Artists Found
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-md">
                    {searchTerm 
                      ? `No artists match "${searchTerm}"` 
                      : "No artists found in your library"
                    }
                  </p>
                  {searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSearchTerm("")}
                      className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
                    >
                      Clear Search
                    </motion.button>
                  )}
                </motion.div>
              ) : isLoading ? (
                // 🔄 Enhanced Loading Animation
                <div className="flex justify-center items-center h-32 sm:h-40">
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.1, 1]
                    }}
                    transition={{
                      rotate: { duration: 1, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1.2, repeat: Infinity }
                    }}
                    className="w-10 h-10 border-3 border-purple-500 border-t-transparent rounded-full"
                  />
                </div>
              ) : viewMode === "grid" ? (
                // 🎵 Enhanced Grid View
                <>
                  <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 2xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4"
                  >
                    {paginatedArtists.map((artist, index) => (
                      <motion.div
                        key={artist.name}
                        variants={cardVariants}
                        whileHover="hover"
                        className={`bg-gradient-to-br ${getRandomColor(artist.name)} rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/10 hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden`}
                        onClick={() => setSelectedArtist(artist.name)}
                      >
                        <div className="relative mb-2 sm:mb-3">
                          <img
                            src={artist.image}
                            alt={artist.name}
                            className="w-full aspect-square rounded-lg sm:rounded-xl object-cover shadow-lg group-hover:shadow-xl transition-all"
                            onError={(e) => {
                              e.target.src = `https://picsum.photos/seed/${artist.name}/300/300`;
                            }}
                          />
                          
                          {/* Play Button Overlay */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handlePlayArtist(artist.songs, e)}
                            className="absolute bottom-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-400 z-10"
                          >
                            <Play size={10} className="text-white ml-0.5" fill="currentColor" />
                          </motion.button>

                          {/* Popularity Badge */}
                          {artist.popularity >= 15 && (
                            <div className="absolute top-1 right-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full w-5 h-5 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">★</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center space-y-1">
                          <h3 className="text-white font-semibold text-xs sm:text-sm truncate leading-tight">
                            {artist.name}
                          </h3>
                          <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Music size={10} />
                              {artist.count}
                            </span>
                            <span className="text-gray-600">•</span>
                            <span className="flex items-center gap-1">
                              <Album size={10} />
                              {artist.albums}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* 🧭 Enhanced Pagination Controls */}
                  {totalPages > 1 && (
                    <motion.div
                      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8 p-3 sm:p-4 glass-effect rounded-xl sm:rounded-2xl border border-white/10"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, artists.length)} of {artists.length}
                      </div>

                      <div className="flex items-center gap-1 sm:gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handlePrev}
                          disabled={currentPage === 1}
                          className={`p-2 sm:p-2 rounded-lg transition-all ${
                            currentPage === 1
                              ? "text-gray-500 cursor-not-allowed bg-white/5"
                              : "bg-white/10 text-white hover:bg-white/20 glass-effect"
                          }`}
                        >
                          <ChevronLeft size={16} />
                        </motion.button>

                        <div className="flex items-center gap-1">
                          {getPaginationRange().map((page, index) => (
                            page === '...' ? (
                              <span key={`dots-${index}`} className="px-2 text-gray-500">
                                ...
                              </span>
                            ) : (
                              <button
                                key={page}
                                onClick={() => handlePageClick(page)}
                                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg transition-colors text-xs sm:text-sm font-medium ${
                                  currentPage === page
                                    ? "bg-purple-600 text-white shadow-lg"
                                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                                }`}
                              >
                                {page}
                              </button>
                            )
                          ))}
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleNext}
                          disabled={currentPage === totalPages}
                          className={`p-2 sm:p-2 rounded-lg transition-all ${
                            currentPage === totalPages
                              ? "text-gray-500 cursor-not-allowed bg-white/5"
                              : "bg-white/10 text-white hover:bg-white/20 glass-effect"
                          }`}
                        >
                          <ChevronRight size={16} />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </>
              ) : (
                // 📋 Enhanced List View
                <motion.div
                  variants={containerVariants}
                  className="glass-effect rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden"
                >
                  {paginatedArtists.map((artist, index) => (
                    <motion.div
                      key={artist.name}
                      variants={cardVariants}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedArtist(artist.name)}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={artist.image}
                          alt={artist.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover"
                        />
                        {artist.popularity >= 15 && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full w-4 h-4 flex items-center justify-center">
                            <span className="text-white text-xs">★</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                          {artist.name}
                        </h3>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Music size={12} />
                            {artist.count} song{artist.count !== 1 ? 's' : ''}
                          </span>
                          <span className="text-gray-600 hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Album size={12} />
                            {artist.albums} album{artist.albums !== 1 ? 's' : ''}
                          </span>
                          <span className="text-gray-600 hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDuration(artist.duration)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handlePlayArtist(artist.songs, e)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <Play size={14} fill="currentColor" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleShuffleArtist(artist.songs, e)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <Shuffle size={14} />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ) : (
            // 🎶 Enhanced Artist Songs View
            <motion.div
              key="artist-songs"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 flex flex-col"
            >
              {/* Artist Header */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 border border-white/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedArtist(null)}
                      className="flex items-center text-gray-400 hover:text-white transition-colors glass-effect rounded-lg sm:rounded-xl p-2 border border-white/10 hover:border-white/20"
                    >
                      <ChevronLeft size={18} />
                    </motion.button>
                    <div className="min-w-0">
                      <h3 className="text-white font-semibold text-lg sm:text-xl md:text-2xl truncate">
                        {selectedArtist}
                      </h3>
                      <p className="text-gray-400 text-xs sm:text-sm truncate">
                        All songs by this artist • {artists.find(a => a.name === selectedArtist)?.count} songs
                      </p>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const artist = artists.find(a => a.name === selectedArtist);
                        if (artist) handlePlayArtist(artist.songs);
                      }}
                      className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
                    >
                      <Play size={14} fill="currentColor" />
                      Play All
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        const artist = artists.find(a => a.name === selectedArtist);
                        if (artist) handleShuffleArtist(artist.songs);
                      }}
                      className="bg-white/10 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
                    >
                      <Shuffle size={14} />
                      Shuffle
                    </motion.button>
                  </div>
                </div>
              </motion.section>

              {/* Artist Songs Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4"
              >
                {artists
                  .find((a) => a.name === selectedArtist)
                  ?.songs.map((song, index) => (
                    <SongCard
                      key={song.id || `${song.title}-${index}`}
                      song={song}
                      index={index}
                      showAlbum={true}
                      isCurrentlyPlaying={currentSong?.id === song.id && isPlaying}
                      variant="enhanced"
                    />
                  ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default Artists;