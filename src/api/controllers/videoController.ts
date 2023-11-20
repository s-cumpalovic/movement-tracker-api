import type { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fluentffmpeg from 'fluent-ffmpeg';
import fs from 'fs/promises';

import { ensureDirExists } from "../../utilities/helperFunctions";
import {
  temporaryImageDir,
  temporaryVideoDir,
  finalVideoDir,
  persistentVideoDir,
  storage,
  VIDEO_FILE_EXTENSION,
  OUTPUT_SUFFIX,
  IMAGE_FILE_EXTENSION
} from "../../utilities/constants";
import { create, getData, getVideoById, deleteVideo } from "../../services/videoService";

ensureDirExists(temporaryImageDir);
ensureDirExists(temporaryVideoDir);
ensureDirExists(finalVideoDir);
ensureDirExists(persistentVideoDir);

const upload = multer({ storage }).single("video");

export const uploadVideo = (req: Request, res: Response): void => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      return res.status(500).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (req.file) {
      const uploadedFileName = req.file.filename;
      const uploadedFilePath = req.file.path;

      fluentffmpeg.ffprobe(uploadedFilePath, (err, metadata) => {
        if (err) {
          return res.status(500).json({ error: "Error obtaining video metadata." });
        }

        const resolution = {
          width: metadata.streams[0].width,
          height: metadata.streams[0].height
        };

        const imageFilename = `${uploadedFileName}${IMAGE_FILE_EXTENSION}`;
        const imagePath = path.join(temporaryImageDir, imageFilename);

        fluentffmpeg(uploadedFilePath)
          .frames(1)
          .output(imagePath)
          .on('end', () => {
            res.status(200).json({
              uuid: uploadedFileName,
              frameImageUrl: `http://localhost:8100/static/temporary-image/${imageFilename}`,
              resolution
            });
          })
          .run();
      });
    } else {
      res.status(400).json({ error: "No file was uploaded." });
    }
  });
};

export async function saveFileToPersistentStorage (req: Request, res: Response) {
  if (!req.body.uuid || !req.body.name || !req.body.coordinates) {
    return res.status(400).json({ error: "Missing required fields in request body." });
  }

  try {
    const name = req.body.name;
    const coordinates = req.body.coordinates;
    const uuidFromReq = req.body.uuid.replace(VIDEO_FILE_EXTENSION, '');
    const uuid = `${uuidFromReq}${OUTPUT_SUFFIX}${VIDEO_FILE_EXTENSION}`;

    const persistentFilePath = path.join(persistentVideoDir, uuid);
    const videoFromTheFolder = path.join(finalVideoDir, uuid);

    create(uuidFromReq, name, coordinates);

    await fs.copyFile(videoFromTheFolder, persistentFilePath);
    return res.status(200).json({ message: `Video saved to persistent storage as ${name}.` });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to save file to persistent storage. Error: " + error.message });
  }
};

export const getRecords = async (req: Request, res: Response) => {
  try {
    const data = await getData();
    return res.status(200).json({ data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to get records from database." });
  }
};

export const getRecordById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const data = await getVideoById(id);
    return res.status(200).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to get record from database." });
  }
};

export const deleteRecord = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    const data = await deleteVideo(id);
    return res.status(204).json(data);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to delete record from database." });
  }
};
