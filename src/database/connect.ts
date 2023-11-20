import pkg from "sqlite3";
import { type IRecordFromDB, type IRecord } from "../utilities/constants";

const { Database } = pkg;

const db = new Database("storage/sqlite.db", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the database.");
    createTable();
  }
});

function createTable () {
  const videoTable = `
  CREATE TABLE IF NOT EXISTS videos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL,
    name TEXT NOT NULL,
    coordinates TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime(CURRENT_TIMESTAMP, '+1 hour'))
    )
`;

  db.run(videoTable, (err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log("Table created successfully.");
    }
  });
}

export function insertVideo (uuid: string, name: string, coordinates: string) {
  const sql = `INSERT INTO videos (uuid, name, coordinates) VALUES ($uuid, $name, $coordinates)`;

  db.run(sql, [uuid, name, coordinates], function (err) {
    if (err) {
      console.error(err.message);
    } else {
      console.log(`A video has been inserted with rowid ${this.lastID}`);
    }
  });
}

export async function getAll (): Promise<IRecordFromDB[]> {
  const sql =
    "SELECT uuid, name, created_at FROM videos ORDER BY created_at DESC";
  return await new Promise((resolve, reject) => {
    db.all(sql, [], (err, rows: IRecordFromDB[]) => {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        console.log("Records retrieved successfully.");
        resolve(rows);
      }
    });
  });
}

export async function getById (uuid: string): Promise<IRecord> {
  const sql = "SELECT * FROM videos WHERE uuid = ?";
  return await new Promise((resolve, reject) => {
    db.get(sql, [uuid], (err: any, row: IRecord) => {
      if (err) {
        console.log(err.message);
      } else {
        console.log("Record retrieved:", row);
        resolve(row);
      }
    });
  });
}

export async function deleteVideoById (uuid: string): Promise<void> {
  const sql = "DELETE FROM videos WHERE uuid = ?";

  await new Promise<void>((resolve, reject) => {
    db.run(sql, [uuid], function (err) {
      if (err) {
        console.error(err.message);
        reject(err);
      } else {
        console.log(`Video with UUID ${uuid} has been deleted successfully.`);
        resolve();
      }
    });
  });
}
