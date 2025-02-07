import Journal from '../models/journalModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

// Create a new journal
export const create_journal = async (req, res) => {
    const { title, article, tags, coverPicture, isPrivate } = req.body;
    const userId = req.user._id;

    try {
        const journal = await Journal.create({
            title,
            article,
            author: userId,
            tags: tags || [],
            coverPicture: coverPicture || '',
            isPrivate: isPrivate || false
        });
        res.status(201).json(journal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get all journals for explore page
export const getExploreJournals = async (req, res) => {
    try {
        const { sort = 'latest', search = '', page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        let query = { isPrivate: false };
        
        // Add search functionality
        if (search) {
            query.$text = { $search: search };
        }

        // Build sort options
        let sortOptions = {};
        if (sort === 'latest') {
            sortOptions = { createdAt: -1 };
        } else if (sort === 'popular') {
            sortOptions = { 'likes.length': -1, createdAt: -1 };
        }

        const journals = await Journal.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .populate('author', 'username profilePicture')
            .lean();

        // Get total count for pagination
        const total = await Journal.countDocuments(query);

        res.status(200).json({
            journals,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get journals by username
export const getPostsByUsername = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const journals = await Journal.find({ 
            author: user._id,
            // Only show private journals to the owner
            ...(req.user?._id?.toString() !== user._id.toString() && { isPrivate: false })
        })
        .sort({ createdAt: -1 })
        .populate('author', 'username profilePicture')
        .lean();

        res.status(200).json(journals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Like/Unlike a journal
export const toggleLike = async (req, res) => {
    try {
        const { journalId } = req.params;
        const userId = req.user._id;

        const journal = await Journal.findById(journalId);
        if (!journal) {
            return res.status(404).json({ error: 'Journal not found' });
        }

        const likeIndex = journal.likes.indexOf(userId);
        if (likeIndex === -1) {
            journal.likes.push(userId);
        } else {
            journal.likes.splice(likeIndex, 1);
        }

        await journal.save();
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a comment
export const addComment = async (req, res) => {
    try {
        const { journalId } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        const journal = await Journal.findById(journalId);
        if (!journal) {
            return res.status(404).json({ error: 'Journal not found' });
        }

        journal.comments.push({
            user: userId,
            content
        });

        await journal.save();
        
        // Populate the new comment's user information
        const populatedJournal = await Journal.findById(journalId)
            .populate('comments.user', 'username profilePicture');

        res.status(200).json(populatedJournal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { journalId, commentId } = req.params;
        const userId = req.user._id;

        const journal = await Journal.findById(journalId);
        if (!journal) {
            return res.status(404).json({ error: 'Journal not found' });
        }

        const comment = journal.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Only allow comment author or journal author to delete
        if (comment.user.toString() !== userId.toString() && 
            journal.author.toString() !== userId.toString()) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        comment.remove();
        await journal.save();
        res.status(200).json(journal);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 