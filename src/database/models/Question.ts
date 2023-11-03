import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
    {
        content: String,
        answerer_name: String,
        answerer_id: String,
        channel_id: String,
    },
    { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const questionSchema = new mongoose.Schema(
    {
        title: String,
        method: String,
        status: {
            type: String,
            enum: ["In progress", "Closed"],
        },
        answers: [answerSchema],
        session_members: [String],
        message_id: String,
        questioner_id: String,
        channel_id: String,
        thread_id: String,
    },
    {
        autoCreate: true,
        timestamps: true,
    }
);

export default mongoose.model("Question", questionSchema);
