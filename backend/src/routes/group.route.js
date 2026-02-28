import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { createGroup, getUserGroups, getGroupMessages, sendGroupMessage, addGroupMember } from '../controllers/group.controller.js';
import { messageUpload } from '../middleware/messageUpload.middleware.js';

const router = express.Router();

router.post('/create', protectRoute, createGroup);
router.get('/', protectRoute, getUserGroups);
router.get('/:id/messages', protectRoute, getGroupMessages);
router.post('/:id/send', protectRoute, messageUpload.single('file'), sendGroupMessage);
router.post('/:id/add-member', protectRoute, addGroupMember);

export default router;
