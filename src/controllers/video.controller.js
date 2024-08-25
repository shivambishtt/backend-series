import asyncHandler from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js"
import apiResponse from "../utils/apiResponse.js"
import { Video } from "../models/video.model.js"
import uploadResult from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const publishAVideo = asyncHandler(async (req, res) => {
    // TODOS: get the data from postman
    // check if the data is coming or not
    // if data is coming then upload the videoFile in cloudinary using uploadResult method

    const { title, description, videoFile, thumbNail, duration } = req.body
    console.log("Title is", title, "Des is", description, "videoF is", videoFile, "thumbnail is", thumbNail, "Duration is", duration);
    if (
        [title, description, videoFile, thumbNail, duration].some((field) => field?.trim() === ""))
        throw new apiError(401, "All fields must be present")

    const videoFileLocalPath = req.files?.videoFile[0]?.path;
    console.log("video file local path", videoFileLocalPath);

    const thumbNailLocalPath = req.files?.thumbNail[0]?.path;

    if (!videoFileLocalPath) {
        throw new apiError(401, "Video file local path not found")
    }
    if (!thumbNailLocalPath) {
        throw new apiError(401, "Thumbnail local path not found")
    }

    const video = await uploadResult(videoFileLocalPath)
    const thumbnail = await uploadResult(thumbNailLocalPath)

    if (!video) {
        throw new apiError(401, "Video is not in cloudinary")
    }
    if (!thumbnail) {
        throw new apiError(401, "Thumbnail is not in cloudinary")
    }

    const createVideo = await Video.create({
        title,
        description,
        videoFile: video?.url,
        thumbNail: thumbnail?.url,
        duration
    })
    if (!createVideo) {
        throw new apiError(401, "An error occured while uploading the video")
    }

    return res
        .status(200)
        .json(new apiResponse("Uploaded the Video successfully", 200, res.user))
})

export { publishAVideo }

