import { Comment } from "../models/comment.model.js";
import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"


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




export { addComment, editComment }