import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

// ✅ Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFolder = async (folderPath, folderName) => {
  const fullPath = path.resolve(folderPath);
  const files = fs.readdirSync(fullPath);
  const uploaded = [];

  for (const file of files) {
    const filePath = path.join(fullPath, file);

    // Skip non-media files
    if (!/\.(jpg|jpeg|png|mp3|wav)$/i.test(file)) continue;

    try {
      const res = await cloudinary.uploader.upload(filePath, {
        folder: `ZMusic/${folderName}`,
        resource_type: file.endsWith(".mp3") ? "video" : "image", // Cloudinary uses 'video' for audio files
      });

      uploaded.push({
        file,
        url: res.secure_url,
      });

      console.log(`✅ Uploaded: ${file} → ${res.secure_url}`);
    } catch (err) {
      console.error(`❌ Failed: ${file}`, err.message);
    }
  }

  return uploaded;
};

// Run upload for both folders
const runUpload = async () => {
  console.log("🚀 Uploading media to Cloudinary...");

  const assets = await uploadFolder("./public/assets", "images");
  const songs = await uploadFolder("./public/songs", "songs");

  const output = { assets, songs };
  fs.writeFileSync("./uploadedUrls.json", JSON.stringify(output, null, 2));

  console.log("✅ Upload complete! URLs saved to uploadedUrls.json");
};

runUpload();
