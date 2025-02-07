import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
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

const anonymousPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    postId: {
        type: String,
        required: true,
        unique: true
    },
    tags: [
        {
            type: String
        }
    ],
    imageUrl: {
        type: String
    },
    likes: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    comments: [commentSchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create indexes for efficient querying
anonymousPostSchema.index({ postId: 1 });
anonymousPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
anonymousPostSchema.index({ likes: -1, views: -1, createdAt: -1 });

const AnonymousPost = mongoose.model('AnonymousPost', anonymousPostSchema);

export default AnonymousPost;
