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

    // const thumbNailLocalPath = req.files?.thumbNail[0]?.path;
    let thumbNailLocalPath
    if (req.files && Array.isArray(req.files.thumbNail) && req.files.thumbNail.length > 0) {
        thumbNailLocalPath = req.files.thumbNail[0].path
    }

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
        .json(new apiResponse("Uploaded the Video successfully", 200, createVideo))
})

const getVideoById = asyncHandler(async (req, res) => {
    // TODO: get the video id from the postman
    // find the id in the database 
    const { videoId } = req.params
    if (!videoId) {
        throw new apiError(401, "Video not given in request")
    }
    const video = await Video.findById(videoId) //when I was using the findById method and was passing the req.paramas.videoId it was throwing a cast error . Cast error occurs because in our mongoDB id is considered as object ID and the id I was entering didn't match so it throw an error
    if (!video) {
        throw new apiError(401, "Video not found in the database")
    }
    return res
        .status(200)
        .json(new apiResponse("Fetched the video by ID", 200, video))
})

const updateAVideo = asyncHandler(async (req, res) => {
    // TODOS: To update a video
    // Get the video id from the param you want to update
    // Update the title/description anything you want
    // Save the updated changes in the mongo database

    const { videoId } = req.params
    if (!videoId) {
        throw new apiError(401, "Enter the videoId first")
    }
    const { title, description } = req.body
    const video = await Video.findByIdAndUpdate(videoId,
        {
            $set: { title, description }
        },
        { new: true }
    )

    if (!video) {
        throw new apiError(401, "Unexpected error occured")
    }
    return res
        .status(200)
        .json(new apiResponse("Video updated successfully", 200, video))
})

const deleteAVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new apiError(401, "Must enter the correct Video ID")
    }

    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new apiError(401, "Video not deleted")
    }

    return res
        .status(200)
        .json(new apiResponse("Deleted the video", 200, video))
})
export { publishAVideo, getVideoById, updateAVideo, deleteAVideo }

