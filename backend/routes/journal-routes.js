import express from 'express';
import { 
    create_journal, 
    getExploreJournals,
    getPostsByUsername,
    toggleLike,
    addComment,
    deleteComment
} from '../controllers/journal-controller.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Public routes
router.get('/api/journals/explore', getExploreJournals);
router.get('/:username/journals', getPostsByUsername);

// Protected routes - require authentication
router.use(requireAuth);
router.post('/api/journals', create_journal);
router.post('/api/journals/:journalId/like', toggleLike);
router.post('/api/journals/:journalId/comments', addComment);
router.delete('/api/journals/:journalId/comments/:commentId', deleteComment);

export default router; 