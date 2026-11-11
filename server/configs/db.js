import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected successfully");
    });

    const mongodbURI = process.env.MONGODB_URI;
    const projectName = "resume-builder";

    if (!mongodbURI) {
      throw new Error("MONGODB_URI environment variable not set");
    }

    await mongoose.connect(mongodbURI, {
      dbName: projectName,
      connectTimeoutMS: 10_000,
      serverSelectionTimeoutMS: 10000,
      bufferTimeoutMS: 10_000,
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message || error);
    throw error;
  }
};

export default connectDB;
