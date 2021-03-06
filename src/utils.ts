import { Dirent, promises as fs } from "fs";
import path from "path";
import { postgres2Bigquery } from "./core";

async function cleanPath(dir: string, dirent: Dirent) {
  const filePath = path.join(dir, dirent.name);

  if (dirent.isFile()) {
    await fs.unlink(filePath);
  } else if (dirent.isDirectory()) {
    await fs.rm(filePath, { recursive: true, force: true });
  }
}

export async function cleanUp(dir: string) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  const direntPromises = [];
  for (const dirent of dirents) {
    direntPromises.push(cleanPath(dir, dirent));
  }

  await Promise.all(direntPromises);
}

export async function convertFile(
  file: string,
  input: string,
  output: string,
  dataset: string,
  tableRegexes: RegExp[]
) {
  const pgQuery = await fs.readFile(path.join(input, file));
  const bQuery = postgres2Bigquery(pgQuery.toString(), dataset, tableRegexes);

  await fs.writeFile(path.join(output, file), bQuery, { mode: 0o700 });
}

function generateTableRegex(table: string) {
  return new RegExp(`(\\W)(${table})(\\W)`, "g");
}

export async function getTableRegexes(file: string) {
  const tables = JSON.parse(
    (await fs.readFile(path.resolve(file))).toString()
  ) as string[];
  return tables.map((table) => generateTableRegex(table));
}
