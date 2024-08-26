import { Router } from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { publishAVideo, getVideoById, updateAVideo, deleteAVideo, toggleIsPublish } from '../controllers/video.controller.js';

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
router.route('/toggle-video/:videoId').get(toggleIsPublish)
export default router