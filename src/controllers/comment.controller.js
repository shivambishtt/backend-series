import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import mongoose from "mongoose"


const addComment = asyncHandler(async (req, res) => {

    const { videoId } = req.params
    const { content } = req.body
    if (!videoId) {
        throw new apiError(401, "Please enter the correct URL or enter the URL first")
    }
    const comment = await Comment.create({ content })
    if (!comment?.length === 0) {
        throw new apiError(401, "Couldn't create comment")
    }
    return res
        .status(200)
        .json(new apiResponse("Comment added successfully ", 200, videoId))
})

const editComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body

    if (!commentId) {
        throw new apiError(401, "Please provide comment Id")
    }

    const comment = await Comment.findByIdAndUpdate(commentId,
        {
            $set: {
                content
            }
        },
        { new: true }
    )
    if (!comment) {
        throw new apiError(401, "Comment doesn't exist in the datbase")
    }

    return res
        .status(200)
        .json(new apiResponse("Edited commented successfully ", 200, commentId))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!commentId) {
        throw new apiError(401, "Please enter the comment Id first")
    }
    await Comment.findByIdAndDelete(commentId)

    return res
        .status(200)
        .json(new apiResponse("Deleted commented successfully ", 200, commentId))
})

const getCommentForVideos = asyncHandler(async (req, res) => {
    // TODOS: Get the videoId 
    // Check if the ID is correct that is if the videoId is given or not
    // If it is given then what I need to do is I need to collect all the comments for a particular video that is I need to count the document of comment in the video field

    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const video = await Video.findById(videoId);

    if (!video) {
        throw new apiError(404, "Video not found");
    }

    const commentsAggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",  // kahan se lera hu
                localField: "owner", // ye waali field me lena chahta hu
                foreignField: "_id",
                as: "owner" // us array ka naam
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                likesCount: {
                    $size: "$likes"
                },
                owner: {
                    $first: "$owner"
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                likesCount: 1,
                owner: {
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1
                },
                isLiked: 1
            }
        }
    ]);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const comments = await Comment.aggregatePaginate(
        commentsAggregate,
        options
    );

    return res
        .status(200)
        .json(new apiResponse("Comments fetched succesfully ", 200, videoId,
            comments));
});


export { addComment, editComment, deleteComment, getCommentForVideos }