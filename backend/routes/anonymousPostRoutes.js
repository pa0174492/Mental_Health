import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import AnonymousPost from '../models/AnonymousPost.js';
import { 
  getAnonymousPosts, 
  createAnonymousPost,
  addComment,
  likePost,
  likeComment,
  getTrendingPosts
} from '../controller/anonymous-controller.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/posts');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get all posts with search functionality
router.get('/posts', async (req, res) => {
  try {
    const { search, tag } = req.query;
    let query = {};
    
    if (search) {
      if (search.startsWith('#')) {
        // Search by post ID
        query.postId = search.substring(1);
      } else {
        // Text search across multiple fields
        query = {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { content: { $regex: search, $options: 'i' } },
            { tags: { $in: [new RegExp(search, 'i')] } }
          ]
        };
      }
    }

    if (tag) {
      query.tags = { $in: [new RegExp(tag, 'i')] };
    }
    
    const posts = await AnonymousPost.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create a new post
router.post('/create', upload.single('image'), async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    
    const newPost = new AnonymousPost({
      title,
      content,
      tags: tags ? JSON.parse(tags) : [],
      postId: uuidv4().substring(0, 8),
      imageUrl: req.file ? `/uploads/posts/${req.file.filename}` : null
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Add a comment to a post
router.post('/comment/:postId', async (req, res) => {
  try {
    const { content } = req.body;
    const post = await AnonymousPost.findOne({ postId: req.params.postId });
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    post.comments.unshift({ content });
    await post.save();
    
    res.json(post);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Like a post
router.post('/like/:postId', async (req, res) => {
  try {
    const post = await AnonymousPost.findOne({ postId: req.params.postId });
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    post.likes += 1;
    await post.save();
    
    res.json(post);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Like a comment
router.post('/comment/like/:postId/:commentId', async (req, res) => {
  try {
    const post = await AnonymousPost.findOne({ postId: req.params.postId });
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }
    
    comment.likes += 1;
    await post.save();
    
    res.json(post);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get a specific post
router.get('/post/:postId', async (req, res) => {
  try {
    const post = await AnonymousPost.findOne({ postId: req.params.postId });
    
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    
    // Increment views
    post.views += 1;
    await post.save();
    
    res.json(post);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Get trending posts
router.get('/trending', async (req, res) => {
  try {
    const posts = await AnonymousPost.find()
      .sort({ likes: -1, views: -1, createdAt: -1 })
      .limit(10);
    res.json(posts);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Post routes
router.get('/api/posts', getAnonymousPosts);
router.post('/api/posts/create', upload.single('image'), createAnonymousPost);
router.get('/api/posts/trending', getTrendingPosts);

// Comment routes
router.post('/api/posts/:postId/comments', addComment);

// Like routes
router.post('/api/posts/:postId/like', likePost);
router.post('/api/posts/:postId/comments/:commentId/like', likeComment);

export default router;
