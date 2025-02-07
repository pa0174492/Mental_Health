import express from 'express';
import MeditationSession from '../models/MeditationSession.js';
import User from '../models/userModel.js';

const router = express.Router();

// Get all meditation sessions for a user
router.get('/sessions/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const sessions = await MeditationSession.find({ user: user._id })
      .sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Add a new meditation session
router.post('/add/:username', async (req, res) => {
  try {
    const { duration, type, notes } = req.body;
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const newSession = new MeditationSession({
      user: user._id,
      duration,
      type,
      notes,
      date: new Date()
    });

    const session = await newSession.save();
    res.json(session);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

export default router;
