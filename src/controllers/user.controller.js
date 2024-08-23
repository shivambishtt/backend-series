import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { User } from "../models/user.model.js"
import uploadResult from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"


const generateAccessAndRefereshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new apiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body //asking data from frontend or postman
    console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new apiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new apiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar file is required")
    }

    const avatar = await uploadResult(avatarLocalPath)
    const coverImage = await uploadResult(coverImageLocalPath)

    if (!avatar) {
        throw new apiError(400, "Avatar file is required")
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new apiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new apiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body
    if (!(username || email)) {
        throw new apiError(400, "username or email is required")
    }
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new apiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logOutUser = asyncHandler(async (req, res) => {
    //here we wanted to logout the user but we did't had any value or refernce to call the user here so what we did is we designed auth.middleware and there we have written a method that will have access to user so now when we defined a route now we have access to that function jwtverify and also we will have access to the particular user
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true,
        })

    const options = {
        httpOnly: true,
        secure: true,
    }
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, user, "User logged out"))
}

)

const refreshAccessToken = asyncHandler(async (req, res) => {
    // here we are doing incomingrefreshtoken to check whether our req is coming or not if it's not coming that means user doesn't have access to cookies.refreshToken and if he don't have access to it that means he is not loggied
    const incomingRefreshToken = (req.cookies.refreshToken || req.body.refreshToken)
    // console.log("Incoming refresh token", incomingRefreshToken);

    if (!incomingRefreshToken) {
        throw new apiError(401, "User is not Logged In")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        // console.log("Decoded Token is ", decodedToken);


        const user = await User.findById(decodedToken?._id)
        // console.log("User is", user);


        if (!user) {
            throw new apiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new apiError(401, "Refresh token is expired")
        }

        const options = {
            httpOnly: true,
            secure: true,
        }

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)
        // console.log("Access token is ", accessToken, "New Refresh token is", refreshToken);

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new apiResponse(200,
                    { accessToken, refreshToken },
                    "Updated refresh and access token successfully")
            )

    } catch (error) {
        throw new apiError(401, error?.message || "Invalid")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    // TODOS TO CHANGE CURRENT USER'S PASSWORD
    // get the user details like email or username and id
    // get the old password value
    // re write the password field or update it
    // save the updated field in db

    const { oldPassword, newPassword } = req.body

    const user = req.user?._id
    if (!user) {
        throw new apiError(401, "User not found")
    }
    const userDetails = await User.findById(user)
    const isPasswordCorrect = await userDetails.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new apiError(401, "You have changed the password")
    }
    userDetails.password = newPassword
    await userDetails.save({ validateBeforeSave: false })

    return res
        .status(200, "Password changed successfully")
        .json(new apiResponse
            ("Succesfully done", 200, {}))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    // TODOS TO GET CURRENT USER
    // req.body ={username} 
    // we have to check whether this particular user exists in our database or not
    // if the user exists we will simply send a response
    // if it doesn't we will throw an error that it doesn't exist

    // const { username } = req.body //sending the username
    // const user = await User.find({ username })
    // if (user.length === 0) {
    //     throw new apiError(400, "User not found in db")
    // }
    // return res
    //     .status(200)
    //     .json(new apiResponse("User found ", 200, {}))

    return res
        .status(200)
        .json(new apiResponse("Current User fetched ", 200, req.user))
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!(fullName || email)) {
        throw new apiError(404, "Enter fields first")
    }
    const user = await User.findByIdAndUpdate(req.user?.id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new apiResponse("Updated account details ",
            200,
            user))
})


const updateUserAvatar = asyncHandler(async (req, res) => {
    // TODO to update avatar
    // userid
    // take avatar from the user
    // multer middleware

    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new apiError(404, "Avatar localpath not found")
    }
    const avatar = await uploadResult(avatarLocalPath)
    if (!avatar.url) {
        throw new apiError(404, "Avatar file is not in cloudinary")
    }
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {

        }).select("-password")
    return res
        .status(200)
        .json(new apiResponse("Avatar updated successfully", 200, res.user))
})

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new apiError(404, "Cover image localpath not found")
    }
    const coverImage = await uploadResult(coverImageLocalPath)
    if (!coverImage.url) {
        throw new apiError(404, "Cover image file is not in cloudinary")
    }
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        }, { new: true })
        .select("-password")
    return res
        .status(200)
        .json(new apiResponse("Cover image updated successfully", 200, res.user))
})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim("")) {
        throw new apiError(400, "Username is missing")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            },
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            } //subscriber fields
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            } //subscribedTo fields
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"//document to count for instance in this we have to count the subscribers (users)
                },
                subscribedToCounts: {
                    $size: "$subscribedTo"//document to count for instance in this we have to count the channel the creator or user subscribed
                },
                // we are creating isSubscribed functionality to check or toggle the state that whether the user has subscribed or not we can send this condition to the frontend team
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false,
                    },
                }
            }
        },
        { //project is used for including or excluding field in the document
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                subscribedToCounts: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ])
    if (!channel?.length) {
        throw new apiError(404, "Channel does not exist")
    }
    return res
        .status(200)
        .json(new apiResponse("Found the user channel", 200, channel[0]))
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)//we didn't use req.user._id as it will conflict because it is not operated by the mongoose but directly by the 
            }
        },
        {
            $lookup: {
                from: "videos", // konsi collection se join karna hai
                localField: "watchHistory", // field local document me
                foreignField: "_id", // from ke andar wali field 
                as: "watchHistory", //uska naam
                pipeline: [
                    {
                        $lookup: { // now we are inside the video and here we are implementing the lookup pipeline
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                        coverImage: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])
    return res
        .status(200)
        .json(new apiResponse("Fethced user watch history successfully", 200, user[0].watchHistory))
})

export { registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory }