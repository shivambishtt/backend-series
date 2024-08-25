import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { publishAVideo, getVideoById, updateAVideo, deleteAVideo } from '../controllers/video.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router()

router.route('/publish').post(
    upload.fields([
        {
            name: 'videoFile',
            maxCount: 1
        },
        {
            name: 'thumbNail',
            maxCount: 1,
        }
    ]), publishAVideo)
router.route('/get-video/:videoId').get(getVideoById)
router.route('/update-video/:videoId').post(updateAVideo)
router.route('/delete-video/:videoId').post(deleteAVideo)
export default router