const cloudinary = require("cloudinary").v2;
const fs = require("fs");
const dotenv=require("dotenv");
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadOnCloudinary(avatarLocalPath) {

  try {
    if (!avatarLocalPath) return null;
    // cloudinary.uploader.upload()
    const result = await cloudinary.uploader.upload(avatarLocalPath, {
      resource_type: "auto",
    });
    fs.unlinkSync(avatarLocalPath);
    return result;
  } catch (error) {
    fs.unlinkSync(avatarLocalPath);
    return null;
  }
}

module.exports = uploadOnCloudinary;
