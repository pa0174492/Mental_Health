import { v4 as uuidv4 } from 'uuid';
import AnonymousPost from '../models/anonymousSchema.js';

export const getAnonymousPosts = async (req, res) => {
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
      .select('-user') // Exclude user field
      .limit(50);
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createAnonymousPost = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const newPost = new AnonymousPost({
      title,
      content,
      tags: tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [],
      postId: uuidv4().substring(0, 8),
      imageUrl: req.file ? `/uploads/posts/${req.file.filename}` : null
    });

    await newPost.save();
    return res.status(201).json(newPost);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    const post = await AnonymousPost.findOne({ postId });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.comments.unshift({
      content,
      date: new Date(),
      likes: 0
    });

    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await AnonymousPost.findOne({ postId });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    post.likes += 1;
    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const post = await AnonymousPost.findOne({ postId });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    comment.likes += 1;
    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getTrendingPosts = async (req, res) => {
  try {
    const posts = await AnonymousPost.find()
      .sort({ likes: -1, views: -1, createdAt: -1 })
      .select('-user') // Exclude user field
      .limit(10);
    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};