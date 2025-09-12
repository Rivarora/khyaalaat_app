'use server';

import type { Poetry } from './definitions';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'poetry.json');

async function readPoetryData(): Promise<Poetry[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    const poetryData: Poetry[] = JSON.parse(fileContent);
    // Ensure comments array exists for each poem
    return poetryData.map(p => ({ ...p, comments: p.comments || [] }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      try {
        await fs.writeFile(dataFilePath, JSON.stringify([]));
      } catch (writeError) {
        console.error('Error creating poetry data file:', writeError);
      }
      return [];
    }
    console.error('Error reading poetry data:', error);
    return [];
  }
}

async function writePoetryData(data: Poetry[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

export async function getPoetryData(): Promise<Poetry[]> {
  return readPoetryData();
}

export async function addPoetry(poetry: Poetry) {
  const currentData = await readPoetryData();
  currentData.unshift(poetry);
  await writePoetryData(currentData);
}

export async function deletePoetryById(poetryId: string): Promise<Poetry | undefined> {
  const currentData = await readPoetryData();
  const poetryToDelete = currentData.find(p => p.id === poetryId);
  if (!poetryToDelete) {
    return undefined;
  }
  const updatedData = currentData.filter(p => p.id !== poetryId);
  await writePoetryData(updatedData);
  return poetryToDelete;
}

export async function updatePoetryLikes(poetryId: string, isLiked: boolean): Promise<void> {
  const currentData = await readPoetryData();
  const updatedData = currentData.map(p => {
    if (p.id === poetryId) {
      return { ...p, likes: p.likes + (isLiked ? 1 : -1) };
    }
    return p;
  });
  await writePoetryData(updatedData);
}

export async function addCommentToPoetry(poetryId: string, comment: string): Promise<void> {
  const currentData = await readPoetryData();
  const updatedData = currentData.map(p => {
    if (p.id === poetryId) {
      const newComments = p.comments ? [...p.comments, comment] : [comment];
      return { ...p, comments: newComments };
    }
    return p;
  });
  await writePoetryData(updatedData);
}
