import { Router } from 'express';
import { loginUser, logOutUser, registerUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import storage from "../middlewares/multer.middleware.js"

// This is considered to be the best way to create routes because it provides a clean interface because rathen than writing our routes in app or index js we write here so it can be used for example i have created a route for the user registration if i have to create the route for login and authentication i can simply do that .It's not neccesairly needed to write complete route again and again
const router = Router()
router.route('/register').post(
    upload.fields([
        {
            name: 'avatar',
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1,
        }
    ]),
    registerUser)
router.route('/login').post(loginUser)
router.route('/logout').post(verifyJWT, logOutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJWT, changeCurrentPassword)
router.route('/get-user').post(verifyJWT, getCurrentUser)
router.route('/update-details').post(verifyJWT, updateAccountDetails)
router.route('/update-avatar').post(storage, verifyJWT, updateUserAvatar)
router.route('/update-cover-image').post(storage, verifyJWT, updateUserCoverImage)

export default router