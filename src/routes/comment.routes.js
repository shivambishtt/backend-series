import { addComment, editComment, deleteComment, getCommentForVideos } from '../controllers/comment.controller.js'
import { Router } from 'express'
import { verifyJWT } from "../middlewares/auth.middleware.js"
const router = Router()

router.use(verifyJWT) // apply verifyJWT to all routes
router.route('/add-comment/:videoId').post(addComment)
router.route('/edit-comment/:commentId').post(editComment)
router.route('/delete-comment/:commentId').post(deleteComment)
router.route('/get-comment-video/:videoId').post(getCommentForVideos)

export default router