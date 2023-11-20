import { exec as execCallback } from "child_process";
import { promisify } from "util";
import path from "path";

import {
  createScriptPath,
  type IRecord,
  type IRecordFromDB,
  OUTPUT_SUFFIX,
  persistentVideoDir,
  VIDEO_FILE_EXTENSION
} from "../utilities/constants";
import { deleteVideoById, getAll, getById, insertVideo } from "../database/connect";
import { ensureDirExists } from "../utilities/helperFunctions";

const exec = promisify(execCallback);
ensureDirExists(persistentVideoDir);

export const processVideo = async (
  videoPath: string,
  coordinates: string
): Promise<any | null> => {
  try {
    const createCommand = `python3 ${createScriptPath} ${videoPath} ${coordinates}`;
    const { stdout: createStdout } = await exec(createCommand);

    return JSON.parse(createStdout);
  } catch (error: any) {
    console.error(`Execution error: ${error.message}`);
    return null;
  }
};

export const create = (
  uuid: string,
  videoName: string,
  coordinates: string
) => {
  insertVideo(uuid, videoName, coordinates);
};

export const createFinalVideo = async (
  filename: string,
  finalFileName: string
) => {
  const outputFileName = `${path.basename(
    finalFileName,
    path.extname(finalFileName)
  )}-output${path.extname(finalFileName)}`;
  const inputPath = path.join(
    __dirname,
    "..",
    "..",
    "temp",
    "final-video",
    finalFileName
  );

  const outputPath = path.join(
    __dirname,
    "..",
    "..",
    "temp",
    "final-video",
    outputFileName
  );
  const ffmpegCommand = `ffmpeg -i ${inputPath} -vcodec libx264 -acodec aac ${outputPath}`;

  try {
    await exec(ffmpegCommand);
    return outputFileName;
  } catch (error: any) {
    console.error(`Execution error: ${error.message}`);
    return null;
  }
};

export const getData = async () => {
  const data: IRecordFromDB[] = await getAll();

  return data;
};

export const getVideoById = async (uuid: string) => {
  const video: IRecord = await getById(uuid);

  const finalVideo = {
    ...video,
    videoUrl: `http://localhost:8100/static/video/${video.uuid}${OUTPUT_SUFFIX}${VIDEO_FILE_EXTENSION}`
  };

  return finalVideo;
};

export const deleteVideo = async (uuid: string) => {
  await deleteVideoById(uuid);
};
