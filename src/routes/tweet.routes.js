import Router from 'express'
import { addTweet, editTweet, deleteTweet, getUserTweet } from '../controllers/tweet.controller.js'
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = Router()

router.use(verifyJWT)
router.route('/add-tweet').post(addTweet)
router.route('/edit-tweet/:tweetId').post(editTweet)
router.route('/delete-tweet/:tweetId').post(deleteTweet)
router.route('/get-user-tweet/:userId').get(getUserTweet)
export default router