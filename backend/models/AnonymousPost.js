import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  }
});

const AnonymousPostSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  postId: {
    type: String,
    required: true,
    unique: true
  },
  comments: [CommentSchema],
  date: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String
  }],
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Create text index for search functionality
AnonymousPostSchema.index({ 
  title: 'text', 
  content: 'text', 
  postId: 'text',
  tags: 'text' 
});

const AnonymousPost = mongoose.model('anonymousPost', AnonymousPostSchema);
export default AnonymousPost;
