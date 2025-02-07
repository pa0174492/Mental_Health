import express from 'express';
import { userSignup, userLogin, getUsers, deleteUser, updateUser, getUserDetails } from '../controller/user-controller.js';
import passport from 'passport';
import '../config/passportConfig.js';
import multer from 'multer';
import { create_journal, getPostsByUsername, update_journal, delete_journal} from '../controller/journal-controller.js';
import { getAnonymousPosts, createAnonymousPost, addComment, likePost, likeComment, getTrendingPosts } from '../controller/anonymous-controller.js';
import { createMood, getMoods } from '../controller/mood-controller.js'; 
const router = express.Router();
import upload from '../multer/multerConfig.js';
import upload1 from '../multer/multerConfig1.js';
import { getJournalById } from '../controller/journal-controller.js';
import cors from 'cors';
import Journal from '../models/journal.js';
import Mood from '../models/mood.js';


router.use(cors());

router.post('/signup', upload.single('profilePicture') ,userSignup);
router.post('/login', userLogin);
router.get('/users', getUsers);
router.get('/:username/getuserdetails', getUserDetails);
router.delete('/delete-user/:username', deleteUser);
router.patch('/:username/update-user', updateUser);

// Anonymous Posts Routes
router.get('/api/posts', getAnonymousPosts);
router.post('/api/posts/create', upload.single('image'), createAnonymousPost);
router.get('/api/posts/trending', getTrendingPosts);
router.post('/api/posts/:postId/comments', addComment);
router.post('/api/posts/:postId/like', likePost);
router.post('/api/posts/:postId/comments/:commentId/like', likeComment);

router.post ('/:username', upload1.single('coverPicture'), create_journal);
router.get('/:username/journals', getPostsByUsername);
router.put('/journals/:username/:id', update_journal);
router.delete('/journal-delete/:username/:id', delete_journal);
router.get('/:username/:id', getJournalById);

//passport.authenticate('jwt', { session: false })

router.get ('/api/moods/:username', getMoods);
router.post ('/api/moods/:username', createMood);

// Explore Journals route
router.get('/api/journals/explore', async (req, res) => {
  try {
    const journals = await Journal.find({ isPrivate: false })
      .populate('author', 'username profilePicture')
      .sort({ createdAt: -1 })
      .lean();
    
    const journalsWithAuthor = journals.map(journal => ({
      ...journal,
      authorName: journal.author.username,
      authorPicture: journal.author.profilePicture,
      author: undefined // Remove the author object to avoid duplication
    }));
    
    res.json(journalsWithAuthor);
  } catch (error) {
    console.error('Error in explore journals:', error);
    res.status(500).json({ error: 'Error fetching explore journals' });
  }
});

// Mood Summary Routes
router.get('/api/moods/:username/summary', async (req, res) => {
  try {
    const { username } = req.params;
    const { period } = req.query; // 'week', 'month', 'year'
    
    let startDate = new Date();
    switch(period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30); // default to last 30 days
    }

    const moods = await Mood.find({
      username,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Calculate mood statistics
    const moodStats = {
      totalEntries: moods.length,
      moodDistribution: {},
      averageMood: 0,
      mostCommonMood: '',
      moodTrend: [],
      dailyAverages: []
    };

    // Calculate distributions and averages
    let moodSum = 0;
    moods.forEach(mood => {
      moodStats.moodDistribution[mood.mood] = (moodStats.moodDistribution[mood.mood] || 0) + 1;
      moodSum += mood.rating || 0;
      
      // Group by date for daily averages
      const dateStr = mood.date.toISOString().split('T')[0];
      const existingDay = moodStats.dailyAverages.find(d => d.date === dateStr);
      if (existingDay) {
        existingDay.moods.push(mood.rating);
      } else {
        moodStats.dailyAverages.push({
          date: dateStr,
          moods: [mood.rating]
        });
      }
    });

    // Calculate averages and find most common mood
    moodStats.averageMood = moods.length ? (moodSum / moods.length).toFixed(2) : 0;
    moodStats.mostCommonMood = Object.entries(moodStats.moodDistribution)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Calculate daily averages
    moodStats.dailyAverages = moodStats.dailyAverages.map(day => ({
      date: day.date,
      average: (day.moods.reduce((a, b) => a + b, 0) / day.moods.length).toFixed(2)
    }));

    // Calculate mood trend (positive, negative, or stable)
    if (moods.length >= 2) {
      const firstWeek = moods.slice(0, 7).reduce((sum, m) => sum + (m.rating || 0), 0) / Math.min(7, moods.length);
      const lastWeek = moods.slice(-7).reduce((sum, m) => sum + (m.rating || 0), 0) / Math.min(7, moods.length);
      moodStats.trend = firstWeek < lastWeek ? 'improving' : firstWeek > lastWeek ? 'declining' : 'stable';
    }

    res.json(moodStats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching mood summary' });
  }
});

export default router; 
