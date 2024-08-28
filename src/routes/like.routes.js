import { Router } from "express";
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)
router.route('/toggle-video-like/:videoId').post(toggleVideoLike)
router.route('/toggle-comment-like/:commentId').post(toggleCommentLike)
router.route('/toggle-tweet-like/:tweetId').post(toggleTweetLike)
router.route('/get-liked-videos').get(getLikedVideos)
export default router