// Multer file uploader helper
// Language: typescript

import multer from "multer";
import path from "path";
import type { StorageEngine } from "multer";
import fs from "fs";

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },

  // fileFilter: (req, file, cb) => {
  //     // reject a file
  //     if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
  //         cb(null, true);
  //     } else {
  //         cb(null, false);
  //     }
  // }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

export default upload;
