// models/Song.js
import mongoose from 'mongoose';

const songSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      required: [true, 'Song ID is required'],
      unique: true,
      index: true,
      validate: {
        validator: (v) => Number.isInteger(v) && v > 0,
        message: 'Song ID must be a positive integer',
      },
    },

    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },

    artist: {
      type: String,
      required: [true, 'Artist name is required'],
      trim: true,
      maxlength: [150, 'Artist name cannot exceed 150 characters'],
      index: true,
    },

    album: {
      type: String,
      required: [true, 'Album name is required'],
      trim: true,
      maxlength: [150, 'Album name cannot exceed 150 characters'],
      index: true,
    },

    duration: {
      type: String,
      required: [true, 'Duration is required'],
      validate: {
        validator: (v) => /^([0-9]{1,2}):([0-9]{2})$/.test(v),
        message: 'Duration must be in MM:SS format',
      },
    },

    image: {
      type: String,
      required: [true, 'Image URL or path is required'],
      validate: {
        validator: (v) =>
          /^https?:\/\/.+\..+/.test(v) ||
          v.startsWith('/assets/') ||
          v.startsWith('/uploads/'),
        message: 'Image must be a valid URL or a local path (starting with /assets or /uploads)',
      },
    },

    audio: {
      type: String,
      required: [true, 'Audio file path or URL is required'],
      validate: {
        validator: (v) =>
          /^https?:\/\/.+\..+/.test(v) ||
          v.startsWith('/songs/') ||
          v.endsWith('.mp3'),
        message: 'Audio must be a valid URL or a local file path ending with .mp3',
      },
    },

    genre: {
      type: String,
      default: 'Unknown',
      trim: true,
      index: true,
    },

    releaseYear: {
      type: Number,
      min: [1900, 'Release year must be after 1900'],
      max: [new Date().getFullYear(), 'Release year cannot be in the future'],
    },

    plays: {
      type: Number,
      default: 0,
      min: 0,
    },

    likes: {
      type: Number,
      default: 0,
      min: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//
// 🧠 Index Optimization
//
songSchema.index({ title: 'text', artist: 'text', album: 'text' });
songSchema.index({ genre: 1, artist: 1 });
songSchema.index({ createdAt: -1 });

//
// 🎧 Virtuals
//
songSchema.virtual('durationInSeconds').get(function () {
  if (!this.duration) return 0;
  const [min, sec] = this.duration.split(':').map(Number);
  return min * 60 + sec;
});

//
// 📦 Static Methods
//
songSchema.statics.findByGenre = function (genre) {
  return this.find({ genre: new RegExp(genre, 'i'), isActive: true });
};

songSchema.statics.getPopular = function (limit = 10) {
  return this.find({ isActive: true }).sort({ plays: -1, likes: -1 }).limit(limit);
};

songSchema.statics.getRecent = function (limit = 10) {
  return this.find({ isActive: true }).sort({ createdAt: -1 }).limit(limit);
};

//
// 🔁 Instance Methods
//
songSchema.methods.incrementPlays = function () {
  this.plays += 1;
  return this.save();
};

songSchema.methods.incrementLikes = function () {
  this.likes += 1;
  return this.save();
};

//
// 🛠 Pre-save middleware
//
songSchema.pre('save', function (next) {
  if (!this.genre || this.genre.trim() === '') this.genre = 'Unknown';

  const capitalize = (s) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1).trim() : s;

  this.title = capitalize(this.title);
  this.artist = capitalize(this.artist);
  this.album = capitalize(this.album);

  next();
});

//
// 🔍 Query Middleware
//
songSchema.pre(/^find/, function (next) {
  if (this.getFilter().isActive === undefined) {
    this.find({ isActive: true });
  }
  next();
});

//
// 🚀 Export Model
//
const Song = mongoose.model('Song', songSchema);
export default Song;
