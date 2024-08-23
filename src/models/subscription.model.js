import mongoose, { Schema } from "mongoose";


const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }, //one who is subscribing (basically username)
    channel: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }// one to whom subscriber is subscribing (basically channel name)

}, { timestamps: true })


export const Subscription = mongoose.model("Subscription", subscriptionSchema)