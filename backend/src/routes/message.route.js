import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getMessages, getUsersForSidebar, sendMessage, deleteMessage, editMessage, addReaction } from '../controllers/message.controller.js';
import { messageUpload } from '../middleware/messageUpload.middleware.js';

const router = express.Router();

router.get('/users', protectRoute, getUsersForSidebar);
router.get('/:id', protectRoute, getMessages);
router.post('/send/:id', protectRoute, messageUpload.single('file'), sendMessage);
router.put('/:id', protectRoute, editMessage);
router.post('/:id/react', protectRoute, addReaction);
router.delete('/:id', protectRoute, deleteMessage);

export default router;