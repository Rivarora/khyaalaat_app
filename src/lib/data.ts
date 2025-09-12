import type { Poetry } from './definitions';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'poetry.json');

async function readPoetryData(): Promise<Poetry[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    // If the file doesn't exist or is empty, create it with an empty array.
    if (error.code === 'ENOENT') {
      await fs.writeFile(dataFilePath, JSON.stringify([]));
      return [];
    }
    // For other errors, return an empty array.
    console.error('Error reading poetry data:', error);
    return [];
  }
}

export async function getPoetryData(): Promise<Poetry[]> {
  return readPoetryData();
}

export async function addPoetry(poetry: Poetry) {
  const currentData = await readPoetryData();
  currentData.unshift(poetry);
  await fs.writeFile(dataFilePath, JSON.stringify(currentData, null, 2));
}
