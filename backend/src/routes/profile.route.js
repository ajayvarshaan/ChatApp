import express from 'express';
import { updateProfile, uploadProfilePic } from '../controllers/profile.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();

router.put('/update', protectRoute, updateProfile);
router.post('/upload-pic', protectRoute, upload.single('profilePic'), uploadProfilePic);

export default router;
