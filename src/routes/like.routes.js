import { Router } from "express";
import { toggleVideoLike, toggleCommentLike } from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWT)
router.route('/toggle-video-like/:videoId').post(toggleVideoLike)
router.route('/toggle-comment-like/:commentId').post(toggleCommentLike)
// router.route('/toggle-tweet-like/:commentId').post(toggleCommentLike)

export default router