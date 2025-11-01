import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Heart, MoreHorizontal, Clock } from "lucide-react";
import { useMusicPlayer } from "../context/MusicPlayerContext";

const SongCard = ({ song, index, showAlbum = true, highlightQuery = "" }) => {
  const { currentSong, isPlaying, playSong, toggleLike, likedSongs } = useMusicPlayer();

  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;
  const isLiked = likedSongs.includes(song.id);

  /** 🖼️ Resolve image URL from backend or placeholder */
  const getImageSource = () => {
    if (!song?.image) return null;
    if (song.image.startsWith("http")) return song.image;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${baseUrl}/${song.image.replace(/^\/+/, "")}`;
  };

  const imageUrl = getImageSource();

  /** 🧭 Handlers */
  const handlePlayClick = (e) => {
    e.stopPropagation();
    playSong(song, index);
  };

  const handleLikeClick = (e) => {
    e.stopPropagation();
    toggleLike(song.id);
  };

  /** 💡 Text highlighting for search matches */
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <span className="bg-yellow-500/30 text-yellow-200 px-1 rounded">{match}</span>
        {after}
      </>
    );
  };

  /** 🎞️ Animation Variants */
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    hover: {
      scale: 1.02,
      y: -4,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  };

  const imageVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onClick={handlePlayClick}
      onMouseEnter={() => setShowOptions(true)}
      onMouseLeave={() => setShowOptions(false)}
      className="group relative glass-effect rounded-2xl p-4 cursor-pointer border border-white/10 hover:border-white/20 transition-all duration-500 backdrop-blur-xl shadow-lg"
    >
      {/* 🌈 Hover background accent */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        whileHover={{ opacity: 1 }}
      />

      <div className="relative z-10">
        {/* 🖼️ Album Art */}
        <motion.div variants={imageVariants} className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden shadow-lg">
          {imageUrl && !imageError ? (
            <>
              <motion.img
                src={imageUrl}
                alt={song.title}
                className={`w-full h-full object-cover transition-opacity duration-700 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onError={() => setImageError(true)}
                onLoad={() => setImageLoaded(true)}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.4 }}
              />

              {/* Skeleton shimmer */}
              {!imageLoaded && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-600 animate-pulse"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: imageLoaded ? 0 : 1 }}
                />
              )}
            </>
          ) : (
            <motion.div
              className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 6, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-2xl"
              >
                🎵
              </motion.div>
            </motion.div>
          )}

          {/* ▶️ Play / ⏸ Pause button */}
          <motion.div
            className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-500 flex items-center justify-center"
            whileHover={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          >
            <motion.button
              onClick={handlePlayClick}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-purple-600 rounded-full p-3 shadow-xl"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isCurrentlyPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </motion.button>
          </motion.div>

          {/* 🟢 Playing Indicator */}
          {isCurrentlyPlaying && (
            <motion.div
              className="absolute top-2 right-2 bg-green-400 rounded-full p-1 shadow-lg"
              animate={{
                scale: [1, 1.2, 1],
                boxShadow: [
                  "0 0 0 0 rgba(34,197,94,0.7)",
                  "0 0 0 6px rgba(34,197,94,0)",
                  "0 0 0 0 rgba(34,197,94,0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full" />
            </motion.div>
          )}

          {/* ❤️ Like Button */}
          <motion.button
            onClick={handleLikeClick}
            className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-sm transition-all duration-300 ${
              isLiked
                ? "text-red-500 bg-red-500/20 border border-red-500/30"
                : "text-white/80 bg-black/30 border border-white/20 opacity-0 group-hover:opacity-100"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart size={16} className={isLiked ? "fill-current" : ""} />
          </motion.button>
        </motion.div>

        {/* 🎶 Song Details */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {/* Title */}
          <h3 className="text-white font-bold text-base leading-tight mb-1 line-clamp-2 min-h-[2.5rem] group-hover:text-pink-300 transition-colors">
            {highlightQuery ? highlightText(song.title, highlightQuery) : song.title}
          </h3>

          {/* Artist */}
          <p className="text-purple-300 font-medium text-sm truncate">
            {highlightQuery ? highlightText(song.artist, highlightQuery) : song.artist}
          </p>

          {/* Album + Duration */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10 mt-2">
            {showAlbum && (
              <p className="text-gray-400 text-xs truncate mr-2">
                {highlightQuery ? highlightText(song.album, highlightQuery) : song.album}
              </p>
            )}
            <div className="flex items-center space-x-1 text-gray-400 text-xs font-medium">
              <Clock size={12} />
              <span>{song.duration}</span>
            </div>
          </div>
        </motion.div>

        {/* ⋮ Options Button */}
        <AnimatePresence>
          {showOptions && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white/80 hover:text-white transition"
              onClick={(e) => {
                e.stopPropagation();
                // TODO: future menu actions
              }}
            >
              <MoreHorizontal size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Outer Glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 blur-xl -z-10 transition-opacity duration-500"
        whileHover={{ opacity: 1 }}
      />
    </motion.div>
  );
};

export default SongCard;
