import type { Request, Response } from "express";
import fs from "fs";
import path from "path";

import { createFinalVideo, processVideo } from "../../services/videoService";

export const postCoordinates = async (req: Request, res: Response): Promise<void> => {
  const coordinates = req.body.coordinates;
  const filename = req.body.filename;
  const mergedCoordinates = coordinates.x.map((x: number, i: number) => `${Math.round(x)},${Math.round(coordinates.y[i])}`
  ).join(' ');
  const videoPath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "temp",
    "temporary-video",
    filename
  );

  const parsedPath = path.parse(videoPath);
  const finalFileName = `${parsedPath.name}-final${parsedPath.ext}`;

  if (fs.existsSync(videoPath)) {
    const trackingData = await processVideo(videoPath, mergedCoordinates);

    let finalVideo;
    if (trackingData) {
      finalVideo = await createFinalVideo(videoPath, finalFileName);
    }

    const finalVideoPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "temp",
      "final-video",
      finalVideo ?? ""
    );

    console.log("Final video: ", finalVideo);

    res.status(200).json({
      coordinates: mergedCoordinates,
      trackingData,
      videoUrl: `http://localhost:8100/static/final-video/${path.basename(finalVideoPath)}`
    });
  } else {
    res.status(404).send("Video file not found.");
  }
};
