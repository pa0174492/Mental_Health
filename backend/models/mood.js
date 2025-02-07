import mongoose from 'mongoose';

const moodSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    required: true,
    enum: ['happy', 'excited', 'content', 'neutral', 'okay', 'sad', 'anxious', 'stressed']
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  notes: {
    type: String
  },
  activities: [{
    type: String,
    enum: ['exercise', 'meditation', 'reading', 'socializing', 'working', 'studying', 'relaxing', 'other']
  }],
  date: {
    type: Date,
    default: Date.now
  },
  factors: [{
    factor: {
      type: String,
      enum: ['sleep', 'diet', 'exercise', 'social', 'work', 'weather', 'health', 'other']
    },
    impact: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    }
  }],
  sleepHours: {
    type: Number,
    min: 0,
    max: 24
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
moodSchema.index({ username: 1, date: -1 });
moodSchema.index({ username: 1, mood: 1 });
moodSchema.index({ username: 1, rating: 1 });

const Mood = mongoose.model('mood', moodSchema);
export default Mood; 