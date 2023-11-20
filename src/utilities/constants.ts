import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

export const APP_PORT = 8100;
export const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

export const tempDir = path.join(__dirname, "..", "..", "temp");
export const storageDir = path.join(__dirname, "..", "..", "storage");

export const temporaryVideoDir = path.join(tempDir, "temporary-video");
export const temporaryImageDir = path.join(tempDir, "temporary-image");
export const finalVideoDir = path.join(tempDir, "final-video");

export const persistentVideoDir = path.join(storageDir, 'video');

export const createScriptPath = path.join(__dirname, "..", "scripts", "video-create.py");

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, temporaryVideoDir);
  },
  filename: (req, file, cb) => {
    const uniqueFilename = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueFilename);
  }
});

export const VIDEO_FILE_EXTENSION = '.mp4';
export const OUTPUT_SUFFIX = '-final-output';
export const IMAGE_FILE_EXTENSION = '.jpg';

export interface IRecord {
  id: string
  uuid: string
  name: string
  coordinates: string
  created_at: string
  videoUrl: string
}

export interface IRecordFromDB {
  uuid: string
  name: string
  created_at: string
}
