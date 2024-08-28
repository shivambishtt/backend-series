import asyncHandler from "../utils/asyncHandler.js"
import apiResponse from "../utils/apiResponse.js"
import apiError from "../utils/apiError.js"
import { Tweet } from "../models/tweet.model.js"
import mongoose from "mongoose"


const addTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) {
        throw new apiError(401, "Enter the content first")
    }

    const tweet = await Tweet.create({
        content: content,
        owner: req.user._id
    })
    if (!tweet) {
        throw new apiError(401, "An error occured while creating a tweet")
    }
    return res
        .status(200)
        .json(new apiResponse("Successfully added the tweet", 200, tweet))
})

const editTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const { content } = req.body
    if (!tweetId) {
        throw new apiError(401, "Enter the tweetId first")
    }
    if (!content || content.trim().length === 0) {
        throw new apiError(401, "Please fill out the content field")
    }

    const tweet = await Tweet.findByIdAndUpdate(tweetId, {
        content
    }, { new: true })
    if (!tweet) {
        throw new apiError(401, "An error occured while creating a tweet")
    }
    return res
        .status(200)
        .json(new apiResponse("Successfully edited the tweet", 200, tweet))
})

const deleteTweet = asyncHandler(async (req, res) => {
    // TODOS: In order to delete the todo we need to give the id in the params
    // Then we need to check if there is id or not
    // If ID is there then what we need to do find the tweet if the tweet is not found we will simply throw an error saying tweet not found
    // If we have got the tweet then we will check that if the tweet's owner is same req.user._id
    // If they are the same then what we have to do is  we will just simply delete the tweet with the ID number
    const { tweetId } = req.params
    if (!tweetId) {
        throw new apiError(401, "Enter the valid tweet id")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new apiError(401, "Tweet not found in the database")
    }
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new apiError(401, "Only the authorized user can delete the tweet")
    }
    await Tweet.findByIdAndDelete(tweetId)
    return res
        .status(200)
        .json(new apiResponse("Deleted the tweet successfully", 200, tweetId))
})

const getUserTweet = asyncHandler(async (req, res) => {
    const { userId } = req.params
    if (!userId) {
        throw new apiError(401, "Please enter the valid user ID")
    }
    const tweet = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId),
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id", //user ki id
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                        },
                    },
                ],
            },
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "tweet", //like ki id milegi
                as: "likeDetails",
                pipeline: [
                    {
                        $project: {
                            likedBy: 1,
                        },
                    },
                ],
            },
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likeDetails", //hum yahan calculate kar rahe hain ki humara likes count kitna hai basically size jo hai wo hume btata hai ki array ka size ya length kitni hai
                },
                ownerDetails: {
                    $first: "$ownerDetails",
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likeDetails.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            },
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                ownerDetails: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1
            },
        },
    ]);

    return res
        .status(200)
        .json(new apiResponse(" Fetched the all tweets of the user", 200, tweet))
})

export { addTweet, editTweet, deleteTweet, getUserTweet }
