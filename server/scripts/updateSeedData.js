import fs from "fs";

const seedPath = "./seed/seedData.js";
const uploadedUrlsPath = "./uploadedUrls.json";

const seedData = fs.readFileSync(seedPath, "utf-8");
const uploaded = JSON.parse(fs.readFileSync(uploadedUrlsPath, "utf-8"));

let updatedSeed = seedData;

for (const item of uploaded.assets) {
  const regex = new RegExp(`/assets/${item.file}`, "g");
  updatedSeed = updatedSeed.replace(regex, item.url);
}

for (const item of uploaded.songs) {
  const regex = new RegExp(`/songs/${item.file}`, "g");
  updatedSeed = updatedSeed.replace(regex, item.url);
}

fs.writeFileSync(seedPath, updatedSeed, "utf-8");

console.log("✅ seedData.js updated with Cloudinary URLs!");
