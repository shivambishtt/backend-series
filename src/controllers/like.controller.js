import { Like } from '../models/like.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import apiError from '../utils/apiError.js'
import apiResponse from '../utils/apiResponse.js'
import { mongoose } from 'mongoose'


const toggleVideoLike = asyncHandler(async (req, res) => {
    // TODO: What I want to do here is I just want to check if the video is liked then I will unlike it and If it is not liked then I will like it
    // For that we have to ask videoId from the params
    // Then gotta check whether the video with the ID exist or not
    // Right after that I will check that whether I have alreadLiked the video or not
    // If i have liked the video I will simply delete the like 
    // And if I didn't then i will simply create a like with the video Id and the owner

    const { videoId } = req.params
    if (!videoId) {
        throw new apiError(401, "Please enter the videoId first")
    }
    const likedAlready = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id)
        return res
            .status(200)
            .json(new apiResponse("Deleted the liked video", 200, { isLiked: false, videoId }))
    }

    await Like.create({
        video: videoId, video: videoId,
        likedBy: req.user?._id,
    })

    return res
        .status(200)
        .json(new apiResponse("Liked the video successfully", 200, { isLiked: true }))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!commentId) {
        throw new apiError(401, "Enter valid commentId")
    }

    const likedAlready = await Like.findOne({
        comment: commentId, //Konse comment par like kara hai
        likedBy: req.user._id, //Kis user ne Like kara hai
        username: req.user_username
    })
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready._id)
        return res
            .status(200)
            .json(new apiResponse("Deleted the like from the comment", 200, commentId, { isLiked: false }))

    }
    await Like.create({
        comment: commentId,
        likedBy: req.user._id,
        username: req.user_username
    })
    return res
        .status(200)
        .json(new apiResponse("Liked the comment successfully", 200, commentId, { isLiked: true }))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!tweetId) {
        throw new apiError(401, "Please enter the Tweet ID first")
    }
    const likedAlready = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    if (likedAlready) {
        await Like.findByIdAndDelete(likedAlready?._id)
        return res
            .status(200)
            .json(new apiResponse("Deleted the tweet's like successfully", 200, { tweetId, isLiked: false }))
    }
    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    return res
        .status(200)
        .json(new apiResponse("Added the tweet's like successfully", 200, { tweetId, isLiked: true }))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideosAggegate = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideo",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        },
                    },
                    {
                        $unwind: "$ownerDetails",
                    },
                ],
            },
        },
        {
            $unwind: "$likedVideo",
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $project: {
                _id: 0,
                likedVideo: {
                    _id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    ownerDetails: {
                        username: 1,
                        fullName: 1,
                        "avatar.url": 1,
                    },
                },
            },
        },
    ]);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideosAggegate,
                "liked videos fetched successfully"
            )
        );
});

export { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos }