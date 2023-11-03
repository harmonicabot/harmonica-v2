import mongoose from "mongoose";

export async function databaseConnection() {
    return await mongoose.connect(process.env.MONGODB_URI!);
}