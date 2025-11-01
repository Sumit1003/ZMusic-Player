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
  Album,
  Music,
  Clock,
  Calendar,
  X,
  MoreHorizontal,
  Star
} from "lucide-react";
import SongCard from "../components/SongCard";
import Navbar from "../components/Navbar";
import { useMusicPlayer } from "../context/MusicPlayerContext";

const ITEMS_PER_PAGE = 12;

const Albums = () => {
  const { filteredSongs, playSong, currentSong, isPlaying } = useMusicPlayer();
  const [selectedAlbum, setSelectedAlbum] = useState(null);
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

  /** 🌍 Enhanced Backend URL helper */
  const getBackendUrl = (path, fallbackSeed = "default") => {
    const base = import.meta.env.VITE_API_URL || "https://z-music-uq5m.onrender.com";
    if (!path) return `https://picsum.photos/seed/${fallbackSeed}/300/300`;
    if (path.startsWith("http")) return path;
    return `${base}/${path.replace(/^\/+/, "")}`;
  };

  /** 💿 Enhanced Album categorization with statistics */
  const albums = useMemo(() => {
    const map = {};
    filteredSongs.forEach((song) => {
      if (!song.album) return;
      
      if (!map[song.album]) {
        map[song.album] = {
          songs: [],
          totalDuration: 0,
          artists: new Set(),
          image: song.image,
          year: song.year || new Date().getFullYear()
        };
      }
      map[song.album].songs.push(song);
      if (song.artist) map[song.album].artists.add(song.artist);
      
      // Calculate duration
      if (song.duration) {
        if (typeof song.duration === 'number') {
          map[song.album].totalDuration += song.duration;
        } else if (typeof song.duration === 'string') {
          const [min, sec] = song.duration.split(':').map(Number);
          map[song.album].totalDuration += (min * 60) + (sec || 0);
        }
      }
    });

    let albumList = Object.entries(map).map(([name, data]) => ({
      name,
      count: data.songs.length,
      songs: data.songs,
      image: getBackendUrl(data.image, name),
      artists: Array.from(data.artists),
      duration: data.totalDuration,
      year: data.year,
      popularity: data.songs.length + (data.artists.size * 2)
    }));

    // Apply search filter
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      albumList = albumList.filter(album => 
        album.name.toLowerCase().includes(query) ||
        album.artists.some(artist => artist.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    albumList.sort((a, b) => {
      switch (sortBy) {
        case "songs":
          return b.count - a.count;
        case "year":
          return b.year - a.year;
        case "popular":
          return b.popularity - a.popularity;
        case "duration":
          return b.duration - a.duration;
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return albumList;
  }, [filteredSongs, searchTerm, sortBy]);

  /* 🧭 Enhanced Pagination logic */
  const totalPages = Math.ceil(albums.length / ITEMS_PER_PAGE);
  const paginatedAlbums = albums.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, albums.length]);

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
  const handlePlayAlbum = useCallback((albumSongs, e) => {
    e?.stopPropagation();
    if (albumSongs.length > 0) {
      playSong(albumSongs[0], albumSongs);
    }
  }, [playSong]);

  const handleShuffleAlbum = useCallback((albumSongs, e) => {
    e?.stopPropagation();
    if (albumSongs.length > 0) {
      const shuffled = [...albumSongs].sort(() => Math.random() - 0.5);
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

  // 🎨 Color themes for album cards
  const albumColors = [
    "from-purple-500/10 to-pink-500/10",
    "from-blue-500/10 to-cyan-500/10",
    "from-green-500/10 to-emerald-500/10",
    "from-orange-500/10 to-red-500/10",
    "from-indigo-500/10 to-purple-500/10",
    "from-rose-500/10 to-pink-500/10"
  ];

  const getRandomColor = (albumName) => {
    const index = albumName.split("").reduce((a, b) => a + b.charCodeAt(0), 0) % albumColors.length;
    return albumColors[index];
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

  // Get selected album data
  const selectedAlbumData = useMemo(() => {
    return albums.find(album => album.name === selectedAlbum);
  }, [albums, selectedAlbum]);

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
          title={selectedAlbum ? selectedAlbum : "Albums"}
          subtitle={
            selectedAlbum 
              ? `Songs from "${selectedAlbum}"`
              : `Browse ${albums.length} albums in your library`
          }
          showSearch={false}
        />

        <AnimatePresence mode="wait">
          {!selectedAlbum ? (
            // 💿 Enhanced Albums View
            <motion.div
              key={`albums-page-${currentPage}`}
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
                      Music Albums
                    </h3>
                    <p className="text-gray-400 text-xs sm:text-sm truncate">
                      Discover and explore albums in your library
                    </p>
                  </div>

                  {/* Right Controls */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {/* Search */}
                    <div className="relative flex-1 sm:flex-none min-w-[140px]">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="text"
                        placeholder="Search albums..."
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
                            <option value="year">Release Year</option>
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
                              <div className="text-white font-semibold">{albums.length}</div>
                              <div className="text-xs">Total</div>
                            </div>
                            <div className="text-center">
                              <div className="text-white font-semibold">{paginatedAlbums.length}</div>
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

              {albums.length === 0 ? (
                // 🎭 Empty State
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4"
                >
                  <div className="text-5xl sm:text-6xl mb-4">💿</div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-3">
                    No Albums Found
                  </h3>
                  <p className="text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-md">
                    {searchTerm 
                      ? `No albums match "${searchTerm}"` 
                      : "No albums found in your library"
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
                    {paginatedAlbums.map((album, index) => (
                      <motion.div
                        key={album.name}
                        variants={cardVariants}
                        whileHover="hover"
                        className={`bg-gradient-to-br ${getRandomColor(album.name)} rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-white/10 hover:border-white/20 transition-all cursor-pointer group relative overflow-hidden`}
                        onClick={() => setSelectedAlbum(album.name)}
                      >
                        <div className="relative mb-2 sm:mb-3">
                          <img
                            src={album.image}
                            alt={album.name}
                            className="w-full aspect-square rounded-lg sm:rounded-xl object-cover shadow-lg group-hover:shadow-xl transition-all"
                            onError={(e) => {
                              e.target.src = `https://picsum.photos/seed/${album.name}/300/300`;
                            }}
                          />
                          
                          {/* Play Button Overlay */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => handlePlayAlbum(album.songs, e)}
                            className="absolute bottom-2 right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-green-400 z-10"
                          >
                            <Play size={10} className="text-white ml-0.5" fill="currentColor" />
                          </motion.button>

                          {/* Popularity Badge */}
                          {album.popularity >= 15 && (
                            <div className="absolute top-1 right-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full w-5 h-5 flex items-center justify-center">
                              <span className="text-white text-xs font-bold">★</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center space-y-1">
                          <h3 className="text-white font-semibold text-xs sm:text-sm truncate leading-tight">
                            {album.name}
                          </h3>
                          <p className="text-gray-400 text-xs truncate">
                            {album.artists.slice(0, 2).join(', ')}
                            {album.artists.length > 2 && '...'}
                          </p>
                          <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs text-gray-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Music size={10} />
                              {album.count}
                            </span>
                            <span className="text-gray-600">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {album.year}
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
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, albums.length)} of {albums.length}
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
                  {paginatedAlbums.map((album, index) => (
                    <motion.div
                      key={album.name}
                      variants={cardVariants}
                      className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors group cursor-pointer"
                      onClick={() => setSelectedAlbum(album.name)}
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src={album.image}
                          alt={album.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl object-cover"
                        />
                        {album.popularity >= 15 && (
                          <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full w-4 h-4 flex items-center justify-center">
                            <span className="text-white text-xs">★</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold text-sm sm:text-base truncate">
                          {album.name}
                        </h3>
                        <p className="text-gray-400 text-xs sm:text-sm truncate mt-1">
                          {album.artists.join(', ')}
                        </p>
                        <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-400 mt-1 flex-wrap">
                          <span className="flex items-center gap-1">
                            <Music size={12} />
                            {album.count} song{album.count !== 1 ? 's' : ''}
                          </span>
                          <span className="text-gray-600 hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {album.year}
                          </span>
                          <span className="text-gray-600 hidden sm:inline">•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {formatDuration(album.duration)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handlePlayAlbum(album.songs, e)}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <Play size={14} fill="currentColor" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleShuffleAlbum(album.songs, e)}
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
            // 🎶 Enhanced Album Songs View
            <motion.div
              key="album-songs"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex-1 flex flex-col"
            >
              {/* Album Header */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-effect rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 border border-white/10"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6">
                  {/* Back Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedAlbum(null)}
                    className="flex items-center text-gray-400 hover:text-white transition-colors glass-effect rounded-lg sm:rounded-xl p-2 border border-white/10 hover:border-white/20 self-start"
                  >
                    <ChevronLeft size={18} />
                  </motion.button>

                  {/* Album Art and Info */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 flex-1">
                    <img
                      src={selectedAlbumData?.image}
                      alt={selectedAlbum}
                      className="w-32 h-32 sm:w-40 sm:h-40 rounded-xl sm:rounded-2xl object-cover shadow-2xl border-4 border-white/10 flex-shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-xl sm:text-2xl md:text-3xl mb-2 truncate">
                        {selectedAlbum}
                      </h3>
                      
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-400 mb-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Music size={14} />
                          {selectedAlbumData?.count} songs
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {selectedAlbumData?.year}
                        </span>
                        <span className="text-gray-600">•</span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDuration(selectedAlbumData?.duration || 0)}
                        </span>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePlayAlbum(selectedAlbumData?.songs || [])}
                          className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          <Play size={16} fill="currentColor" />
                          Play Album
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleShuffleAlbum(selectedAlbumData?.songs || [])}
                          className="bg-white/10 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl flex items-center gap-2 hover:bg-white/20 transition-colors border border-white/20 text-sm font-medium"
                        >
                          <Shuffle size={16} />
                          Shuffle
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Album Songs Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4"
              >
                {selectedAlbumData?.songs.map((song, index) => (
                  <SongCard
                    key={song.id || `${song.title}-${index}`}
                    song={song}
                    index={index}
                    showArtist={false}
                    showAlbum={false}
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

export default Albums;