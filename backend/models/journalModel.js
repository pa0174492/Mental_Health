import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    article: {
        type: String,
        required: true
    }, 
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    coverPicture: {
        type: String, // This will store the file path
        default: ''
    },
    tags: [{
        type: String
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        content: {
            type: String,
            required: true
        },
        date: {
            type: Date,
            default: Date.now
        }
    }],
    isPrivate: {
        type: Boolean,
        default: false
    }
},
{ timestamps: true });

// Create indexes for better query performance
journalSchema.index({ title: 'text', article: 'text', tags: 'text' });
journalSchema.index({ author: 1, createdAt: -1 });
journalSchema.index({ isPrivate: 1 });

const Journal = mongoose.model('Journal', journalSchema);
export default Journal;


