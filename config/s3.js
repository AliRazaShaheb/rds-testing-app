const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Multer config for local file storage (memory)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Upload file buffer to S3
async function uploadToS3(fileBuffer, originalName, mimetype) {
  const ext = path.extname(originalName) || ".jpg";
  const fileName = `profile-photos/${Date.now()}-${uuidv4()}${ext}`;
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
    // ACL: "public-read",
  };
  await s3.send(new PutObjectCommand(params));
  const url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  return url;
}

// Delete file from S3 by URL
async function deleteFileFromS3(fileUrl) {
  if (!fileUrl) return;
  const url = new URL(fileUrl);
  // Key is everything after the bucket host
  const key = url.pathname.replace(/^\//, "");
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  };
  await s3.send(new DeleteObjectCommand(params));
}

module.exports = {
  s3,
  upload,
  uploadToS3,
  deleteFileFromS3,
};
