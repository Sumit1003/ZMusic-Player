// routes/songRoutes.js
import express from 'express';
import cors from 'cors';
import Song from '../models/Song.js';

const router = express.Router();

/* ------------------------- 🌐 CORS CONFIGURATION ------------------------- */
router.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ✅ Handle preflight requests
router.options('*', cors());

/* ------------------------- 🧩 HELPER FUNCTION ------------------------- */
const handleError = (res, error, message = 'Server Error', status = 500) => {
  console.error(`❌ ${message}:`, error);
  return res.status(status).json({
    status: 'error',
    message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
};

/* ------------------------- 🎵 ROUTES ------------------------- */

/**
 * @route   GET /api/songs
 * @desc    Fetch all songs
 */
router.get('/', async (req, res) => {
  try {
    const songs = await Song.find().sort({ id: 1 }).lean();
    res.status(200).json({
      status: 'success',
      count: songs.length,
      data: songs,
    });
  } catch (error) {
    handleError(res, error, 'Error fetching songs');
  }
});

/**
 * @route   GET /api/songs/album/:albumName
 * @desc    Fetch songs by album
 */
router.get('/album/:albumName', async (req, res) => {
  try {
    const albumName = decodeURIComponent(req.params.albumName.trim());
    const songs = await Song.find({ album: new RegExp(`^${albumName}$`, 'i') }).sort({ id: 1 }).lean();

    if (!songs.length) {
      return res.status(404).json({
        status: 'fail',
        message: `No songs found for album "${albumName}"`,
      });
    }

    res.status(200).json({
      status: 'success',
      count: songs.length,
      data: songs,
    });
  } catch (error) {
    handleError(res, error, 'Error fetching songs by album');
  }
});

/**
 * @route   GET /api/songs/search/:query
 * @desc    Search songs by title, artist, or album
 */
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query.trim();
    if (!query) {
      return res.status(400).json({ status: 'fail', message: 'Search query cannot be empty' });
    }

    const songs = await Song.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { artist: { $regex: query, $options: 'i' } },
        { album: { $regex: query, $options: 'i' } },
      ],
    })
      .sort({ id: 1 })
      .lean();

    if (!songs.length) {
      return res.status(404).json({
        status: 'fail',
        message: `No songs found for "${query}"`,
      });
    }

    res.status(200).json({
      status: 'success',
      count: songs.length,
      data: songs,
    });
  } catch (error) {
    handleError(res, error, 'Error searching songs');
  }
});

/**
 * @route   GET /api/songs/:id
 * @desc    Fetch a single song by its numeric ID
 */
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid song ID format' });
    }

    const song = await Song.findOne({ id }).lean();
    if (!song) {
      return res.status(404).json({ status: 'fail', message: 'Song not found' });
    }

    res.status(200).json({
      status: 'success',
      data: song,
    });
  } catch (error) {
    handleError(res, error, 'Error fetching song by ID');
  }
});

/**
 * @route   POST /api/songs
 * @desc    Add a new song
 */
router.post('/', async (req, res) => {
  try {
    const { id, title, artist, album, duration, image, audio } = req.body;

    // Basic validation
    if (!title || !artist || !album || !audio) {
      return res.status(400).json({
        status: 'fail',
        message: 'Title, artist, album, and audio fields are required',
      });
    }

    // Prevent duplicate entries
    const existing = await Song.findOne({ title, artist });
    if (existing) {
      return res.status(409).json({
        status: 'fail',
        message: 'This song already exists',
      });
    }

    const newSong = await Song.create({ id, title, artist, album, duration, image, audio });
    res.status(201).json({
      status: 'success',
      message: 'Song added successfully',
      data: newSong,
    });
  } catch (error) {
    handleError(res, error, 'Error adding new song', 400);
  }
});

/* ------------------------- EXPORT ------------------------- */
export default router;
