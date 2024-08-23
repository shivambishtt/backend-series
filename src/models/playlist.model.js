import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    videos: [
        {
            type: Schema.Types.ObjectId,
            required: "Video",
        }
    ],
    owner: {
        type: Schema.Types.ObjectId,
        required: "User",
    }


}, { timestamps: true })

export const Playlist = mongoose.model("Playlist", playlistSchema)