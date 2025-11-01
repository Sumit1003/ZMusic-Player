import React, { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Disc3, 
  Search, 
  Filter, 
  Grid3X3,
  List,
  Shuffle,
  Play,
  Heart,
  Clock,
  Album,
  User,
  MoreHorizontal,
  Download,
  Share2,
  Plus
} from "lucide-react";
import SongCard from "../components/SongCard";
import Navbar from "../components/Navbar";
import { useMusicPlayer } from "../context/MusicPlayerContext";

const Library = () => {
  const { 
    filteredSongs, 
    currentSong, 
    isPlaying, 
    playSong, 
    togglePlay,
    toggleLike,
    likedSongs 
  } = useMusicPlayer();
  
  const [selectedAlbum, setSelectedAlbum] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [songsPerPage, setSongsPerPage] = useState(8);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [sortBy, setSortBy] = useState("title"); // 'title', 'artist', 'album', 'recent'
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState(new Set());

  const backendUrl = import.meta.env.VITE_API_URL || "https://z-music-uq5m.onrender.com";

  // 🧩 Responsive configuration
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSongsPerPage(6);
        setViewMode("grid");
      } else if (window.innerWidth < 1024) {
        setSongsPerPage(8);
      } else {
        setSongsPerPage(12);
      }
    };
    
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🖼️ Generate valid image URL
  const getImageUrl = (path, fallbackSeed) => {
    if (!path) return `https://picsum.photos/seed/${fallbackSeed}/300/300`;
    if (path.startsWith("http")) return path;
    const clean = path.startsWith("/") ? path.slice(1) : path;
    return `${backendUrl}/${clean}`;
  };

  // 🎵 Build albums with enhanced data
  const albums = useMemo(() => {
    const albumMap = filteredSongs.reduce((acc, song) => {
      if (!acc[song.album]) {
        acc[song.album] = {
          songs: [],
          totalDuration: 0,
          likedCount: 0
        };
      }
      acc[song.album].songs.push(song);
      // Calculate approximate duration in seconds
      const [min, sec] = song.duration.split(':').map(Number);
      acc[song.album].totalDuration += (min * 60) + sec;
      if (likedSongs.includes(song.id)) {
        acc[song.album].likedCount++;
      }
      return acc;
    }, {});

    const albumList = Object.entries(albumMap).map(([album, data], i) => {
      const duration = data.totalDuration;
      const hours = Math.floor(duration / 3600);
      const minutes = Math.floor((duration % 3600) / 60);
      
      return {
        name: album,
        count: data.songs.length,
        likedCount: data.likedCount,
        duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
        image: getImageUrl(data.songs[0]?.image, album || i),
        songs: data.songs
      };
    });

    return [
      {
        name: "all",
        count: filteredSongs.length,
        likedCount: likedSongs.length,
        duration: "All",
        image: "https://cdn-icons-png.flaticon.com/512/566/566984.png",
        isAll: true
      },
      ...albumList,
    ];
  }, [filteredSongs, likedSongs]);

  // 🎛️ Sort and filter songs
  const filteredByAlbum = useMemo(() => {
    let filtered = selectedAlbum === "all" 
      ? [...filteredSongs] 
      : filteredSongs.filter((s) => s.album === selectedAlbum);

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.artist.toLowerCase().includes(q) ||
          s.album.toLowerCase().includes(q)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "artist":
          return a.artist.localeCompare(b.artist);
        case "album":
          return a.album.localeCompare(b.album);
        case "recent":
          return b.id - a.id; // Assuming higher ID = more recent
        case "title":
        default:
          return a.title.localeCompare(b.title);
      }
    });

    return filtered;
  }, [filteredSongs, selectedAlbum, searchTerm, sortBy]);

  // 📜 Pagination
  const totalPages = Math.ceil(filteredByAlbum.length / songsPerPage);
  const start = (currentPage - 1) * songsPerPage;
  const currentSongs = filteredByAlbum.slice(start, start + songsPerPage);

  const handleNext = () => currentPage < totalPages && setCurrentPage((p) => p + 1);
  const handlePrev = () => currentPage > 1 && setCurrentPage((p) => p - 1);

  // 🎮 Player actions
  const handlePlayAlbum = useCallback(() => {
    if (filteredByAlbum.length > 0) {
      playSong(filteredByAlbum[0], 0);
    }
  }, [filteredByAlbum, playSong]);

  const handleShufflePlay = useCallback(() => {
    if (filteredByAlbum.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredByAlbum.length);
      playSong(filteredByAlbum[randomIndex], randomIndex);
    }
  }, [filteredByAlbum, playSong]);

  const handleLike = (songId, e) => {
    e?.stopPropagation();
    toggleLike(songId);
  };

  const isLiked = (songId) => likedSongs.includes(songId);

  // 🎨 Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.03 
      } 
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        ease: "easeOut"
      }
    },
  };

  const albumCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.3,
        ease: "backOut"
      }
    },
    hover: {
      scale: 1.05,
      y: -5,
      transition: {
        duration: 0.2
      }
    }
  };

  // Selected album data
  const selectedAlbumData = albums.find(album => album.name === selectedAlbum);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col min-h-0 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900"
    >
      <div 
        className="flex-1 flex flex-col min-h-0 overflow-y-auto scrollbar-thin p-4 sm:p-6 md:p-8 max-w-8xl mx-auto"
        style={{ paddingBottom: "calc(112px + env(safe-area-inset-bottom))" }}
      >
        
        {/* Enhanced Navbar */}
        <Navbar
          title="Music Library"
          subtitle={`${filteredSongs.length} songs • ${albums.length - 1} albums • Your personal collection`}
          showSearch={false}
        />

        {/* 🎛️ Control Bar */}
        <motion.div 
          className="glass-effect rounded-2xl p-4 sm:p-6 mb-6 border border-white/10"
          variants={itemVariants}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left Controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePlayAlbum}
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
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 flex-wrap">
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

          {/* 🎚️ Expanded Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-white/10 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search songs, artists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Sort By */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="title">Sort by Title</option>
                    <option value="artist">Sort by Artist</option>
                    <option value="album">Sort by Album</option>
                    <option value="recent">Sort by Recent</option>
                  </select>

                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-400 bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                    <span>{filteredByAlbum.length} songs</span>
                    <span>•</span>
                    <span>{selectedAlbumData?.duration}</span>
                    <span>•</span>
                    <span>{selectedAlbumData?.likedCount} liked</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* 🎵 Albums Sidebar */}
          <motion.div 
            className="lg:w-80 flex-shrink-0"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="glass-effect rounded-2xl p-4 sm:p-6 border border-white/10 sticky top-4">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <Album size={20} />
                Albums & Playlists
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
                {albums.map((album, index) => (
                  <motion.div
                    key={album.name}
                    variants={albumCardVariants}
                    whileHover="hover"
                    onClick={() => {
                      setSelectedAlbum(album.name);
                      setCurrentPage(1);
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all border ${
                      selectedAlbum === album.name
                        ? "bg-purple-600/20 border-purple-500/50 text-white"
                        : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={album.image}
                        alt={album.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {album.name === "all" ? "All Songs" : album.name}
                        </h4>
                        <p className="text-xs opacity-75">
                          {album.count} songs • {album.likedCount} liked
                        </p>
                      </div>
                      {album.isAll && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Playlist Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-4 p-3 border-2 border-dashed border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                <span className="text-sm">Create Playlist</span>
              </motion.button>
            </div>
          </motion.div>

          {/* 🎵 Main Content */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1"
          >
            {/* Header */}
            <div className="glass-effect rounded-2xl p-4 sm:p-6 mb-6 border border-white/10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-semibold text-xl">
                    {selectedAlbum === "all" 
                      ? "All Songs" 
                      : `"${selectedAlbum}"`}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1 flex items-center gap-4 flex-wrap">
                    <span>{filteredByAlbum.length} songs</span>
                    <span>•</span>
                    <span>{selectedAlbumData?.duration}</span>
                    <span>•</span>
                    <span>{selectedAlbumData?.likedCount} liked</span>
                  </p>
                </div>

                {(selectedAlbum !== "all" || searchTerm || sortBy !== "title") && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedAlbum("all");
                      setSearchTerm("");
                      setSortBy("title");
                      setShowFilters(false);
                    }}
                    className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors rounded-xl border border-white/10"
                  >
                    Clear All
                  </motion.button>
                )}
              </div>
            </div>

            {/* Songs Display */}
            <AnimatePresence mode="wait">
              {filteredByAlbum.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="text-center py-16 glass-effect rounded-2xl border border-white/10"
                >
                  <Disc3 className="mx-auto text-purple-400 mb-4" size={64} />
                  <h3 className="text-2xl font-medium text-white mb-3">
                    No Songs Found
                  </h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Try selecting a different album, adjusting your search, or clearing filters to see more music.
                  </p>
                </motion.div>
              ) : viewMode === "grid" ? (
                /* 🎵 Grid View */
                <motion.div
                  key="grid-view"
                  layout
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4"
                >
                  {currentSongs.map((song, i) => (
                    <SongCard
                      key={`${song.id}-${i}`}
                      song={song}
                      index={i}
                      showAlbum={selectedAlbum === "all"}
                      showLikes
                      onLike={handleLike}
                      isLiked={isLiked(song.id)}
                      variant="enhanced"
                    />
                  ))}
                </motion.div>
              ) : (
                /* 📋 List View */
                <motion.div
                  key="list-view"
                  layout
                  className="glass-effect rounded-2xl border border-white/10 overflow-hidden"
                >
                  {currentSongs.map((song, i) => (
                    <motion.div
                      key={`${song.id}-${i}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center gap-4 p-4 border-b border-white/5 last:border-b-0 hover:bg-white/5 transition-colors group ${
                        currentSong?.id === song.id ? 'bg-purple-600/20' : ''
                      }`}
                      onClick={() => playSong(song, i)}
                    >
                      {/* Play Button */}
                      <div className="w-10 h-10 flex items-center justify-center">
                        {currentSong?.id === song.id && isPlaying ? (
                          <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                        ) : (
                          <Play size={16} className="text-gray-400 group-hover:text-white" />
                        )}
                      </div>

                      {/* Song Image */}
                      <img
                        src={getImageUrl(song.image, song.id)}
                        alt={song.title}
                        className="w-12 h-12 rounded-lg object-cover"
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
                      {selectedAlbum === "all" && (
                        <div className="hidden md:block flex-1 min-w-0">
                          <p className="text-gray-400 text-sm truncate">
                            {song.album}
                          </p>
                        </div>
                      )}

                      {/* Duration */}
                      <div className="text-gray-400 text-sm">
                        {song.duration}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <button className="p-2 text-gray-400 hover:text-white rounded-full">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* 📜 Pagination */}
            {totalPages > 1 && (
              <motion.div 
                className="flex justify-center items-center space-x-4 mt-8"
                variants={itemVariants}
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handlePrev}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-xl flex items-center gap-2 ${
                    currentPage === 1
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20 glass-effect"
                  }`}
                >
                  <ChevronLeft size={18} />
                  <span className="hidden sm:inline">Previous</span>
                </motion.button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? "bg-purple-600 text-white"
                            : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && <span className="text-gray-400">...</span>}
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-xl flex items-center gap-2 ${
                    currentPage === totalPages
                      ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                      : "bg-white/10 text-white hover:bg-white/20 glass-effect"
                  }`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight size={18} />
                </motion.button>
              </motion.div>
            )}
          </motion.section>
        </div>

        {/* spacer to guarantee extra room under page content for a fixed player */}
        <div aria-hidden="true" className="h-28 sm:h-32" />
      </div>
    </motion.div>
  );
};

export default Library;