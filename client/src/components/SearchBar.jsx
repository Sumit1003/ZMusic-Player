// components/SearchBar.jsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Mic, Clock, TrendingUp } from "lucide-react";
import { useMusicPlayer } from "../context/MusicPlayerContext";

const SearchBar = () => {
  const { searchQuery, setSearchQuery, songs } = useMusicPlayer();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [trendingSearches, setTrendingSearches] = useState([]);

  const inputRef = useRef(null);

  /** 🧠 Initialize search history and trending items */
  useEffect(() => {
    const savedHistory = localStorage.getItem("musicSearchHistory");
    if (savedHistory) setSearchHistory(JSON.parse(savedHistory));

    // Generate trending keywords dynamically
    const topArtists = [...new Set(songs.map((s) => s.artist))].slice(0, 5);
    const topAlbums = [...new Set(songs.map((s) => s.album))].slice(0, 3);
    setTrendingSearches([...topArtists, ...topAlbums]);
  }, [songs]);

  /** 💾 Save query to history */
  const saveToHistory = useCallback(
    (query) => {
      const trimmed = query.trim();
      if (!trimmed) return;

      const updated = [trimmed, ...searchHistory.filter((q) => q !== trimmed)].slice(0, 5);
      setSearchHistory(updated);
      localStorage.setItem("musicSearchHistory", JSON.stringify(updated));
    },
    [searchHistory]
  );

  /** 🔁 Sync global query */
  useEffect(() => {
    setLocalQuery(searchQuery);
    if (searchQuery) saveToHistory(searchQuery);
  }, [searchQuery, saveToHistory]);

  /** 🔍 Handle typing */
  const handleChange = (e) => {
    const value = e.target.value;
    setLocalQuery(value);
    setShowSuggestions(value.length > 0);
  };

  /** 🚀 Submit handler */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (localQuery.trim()) {
      setSearchQuery(localQuery.trim());
      saveToHistory(localQuery.trim());
    }
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  /** 🧹 Clear search */
  const clearSearch = () => {
    setLocalQuery("");
    setSearchQuery("");
    setShowSuggestions(false);
  };

  /** 🪄 Click on suggestion */
  const handleSuggestionClick = (suggestion) => {
    setLocalQuery(suggestion);
    setSearchQuery(suggestion);
    saveToHistory(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  /** ❌ Remove item from history */
  const removeFromHistory = (item, e) => {
    e.stopPropagation();
    const updated = searchHistory.filter((i) => i !== item);
    setSearchHistory(updated);
    localStorage.setItem("musicSearchHistory", JSON.stringify(updated));
  };

  /** 🧩 Memoized suggestions */
  const suggestions = useMemo(() => {
    if (!localQuery.trim()) return [];

    const query = localQuery.toLowerCase();
    const results = new Set();

    songs.forEach((song) => {
      if (song.title?.toLowerCase().includes(query)) results.add(song.title);
      if (song.artist?.toLowerCase().includes(query)) results.add(song.artist);
      if (song.album?.toLowerCase().includes(query)) results.add(song.album);
    });

    searchHistory.forEach((h) => {
      if (h.toLowerCase().includes(query) && h !== localQuery) results.add(h);
    });

    return Array.from(results).slice(0, 8);
  }, [localQuery, songs, searchHistory]);

  /** 🎬 Animation variants */
  const containerVariants = {
    hidden: { opacity: 0, y: -15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="mb-6 relative">
      {/* 🔍 Search Input */}
      <form onSubmit={handleSubmit} className="relative">
        <motion.div
          className={`relative rounded-2xl transition-all duration-300 ${
            isFocused ? "ring-2 ring-purple-500/40 shadow-purple-500/10" : "shadow"
          }`}
          animate={{ scale: isFocused ? 1.02 : 1 }}
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={localQuery}
            onChange={handleChange}
            onFocus={() => {
              setIsFocused(true);
              setShowSuggestions(localQuery.length > 0);
            }}
            onBlur={() => {
              setIsFocused(false);
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            placeholder="Search songs, artists, or albums..."
            aria-label="Search music"
            className="w-full pl-12 pr-16 py-4 glass-effect rounded-2xl text-white placeholder-gray-400 
                       focus:outline-none focus:bg-white/10 border border-white/10 backdrop-blur-lg"
          />

          {/* 🎙️ Voice Search (coming soon) */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 p-1"
            title="Voice search (coming soon)"
          >
            <Mic size={18} />
          </motion.button>

          {/* ❌ Clear Button */}
          <AnimatePresence>
            {localQuery && (
              <motion.button
                key="clear"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                type="button"
                onClick={clearSearch}
                title="Clear search"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white p-1"
              >
                <X size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </form>

      {/* 🔽 Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0 || trendingSearches.length > 0) && (
          <motion.div
            key="suggestions"
            variants={dropdownVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-full left-0 right-0 mt-2 glass-effect rounded-2xl border border-white/10 
                       backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700/50">
              {/* Suggestions */}
              {suggestions.length > 0 && (
                <SuggestionSection title="Suggestions" icon={<Search size={12} />}>
                  {suggestions.map((s, i) => (
                    <SuggestionItem key={`suggest-${s}-${i}`} label={s} onClick={() => handleSuggestionClick(s)} />
                  ))}
                </SuggestionSection>
              )}

              {/* History */}
              {searchHistory.length > 0 && suggestions.length === 0 && (
                <SuggestionSection title="Recent Searches" icon={<Clock size={12} />}>
                  {searchHistory.map((item, i) => (
                    <HistoryItem
                      key={`hist-${item}-${i}`}
                      label={item}
                      onClick={() => handleSuggestionClick(item)}
                      onRemove={(e) => removeFromHistory(item, e)}
                    />
                  ))}
                </SuggestionSection>
              )}

              {/* Trending */}
              {trendingSearches.length > 0 && suggestions.length === 0 && searchHistory.length === 0 && (
                <SuggestionSection title="Trending Searches" icon={<TrendingUp size={12} />}>
                  {trendingSearches.map((item, i) => (
                    <SuggestionItem
                      key={`trend-${item}-${i}`}
                      label={item}
                      icon={<TrendingUp size={12} className="text-purple-400 mr-2" />}
                      onClick={() => handleSuggestionClick(item)}
                    />
                  ))}
                </SuggestionSection>
              )}

              {/* Tip */}
              <div className="p-3 border-t border-white/5 bg-black/20 text-xs text-gray-400">
                💡 <strong>Tip:</strong> Use quotes for exact matches
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔎 Current Search Info */}
      <AnimatePresence>
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 flex items-center justify-between flex-wrap gap-2"
          >
            <div className="text-sm text-gray-300">
              Showing results for{" "}
              <span className="text-purple-300 font-medium bg-purple-500/20 px-2 py-1 rounded-lg">
                {searchQuery}
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={clearSearch}
              className="text-xs text-gray-400 hover:text-white border border-white/10 hover:border-white/20 
                         rounded-full px-3 py-1 flex items-center space-x-1 glass-effect"
            >
              <X size={12} /> <span>Clear</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* 🧩 Subcomponents for readability */
const SuggestionSection = ({ title, icon, children }) => (
  <div className="p-2 border-t border-white/5 first:border-t-0">
    <div className="text-xs text-gray-400 font-medium px-3 py-2 flex items-center">
      {icon && <span className="mr-2">{icon}</span>}
      {title}
    </div>
    {children}
  </div>
);

const SuggestionItem = ({ label, icon, onClick }) => (
  <motion.button
    whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
    onClick={onClick}
    className="w-full text-left px-3 py-2 rounded-lg text-white text-sm flex items-center justify-between transition"
  >
    <div className="flex items-center truncate">{icon}{label}</div>
    <Search size={14} className="text-gray-400 ml-2 flex-shrink-0" />
  </motion.button>
);

const HistoryItem = ({ label, onClick, onRemove }) => (
  <motion.button
    whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
    onClick={onClick}
    className="w-full text-left px-3 py-2 rounded-lg text-white text-sm flex items-center justify-between group"
  >
    <span className="truncate">{label}</span>
    <div className="flex items-center space-x-2">
      <Clock size={12} className="text-gray-400" />
      <button
        onClick={onRemove}
        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-400"
      >
        <X size={12} />
      </button>
    </div>
  </motion.button>
);

export default SearchBar;
