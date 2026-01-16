import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  timestamp: {
    type: Date
  },
  text: {
    type: String
  }
})

const commentModel = mongoose.model("Comment", commentSchema)
export {commentModel}