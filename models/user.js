import mongoose from "mongoose";
import Thread from '../models/thread.js';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    password:String,
    threads : [{ type: mongoose.Schema.Types.ObjectId, ref: "Thread" }]
})

export default mongoose.model("User", UserSchema);