import type { PoemRequest } from './definitions';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'requests.json');

async function readRequestData(): Promise<PoemRequest[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.writeFile(dataFilePath, JSON.stringify([]));
      return [];
    }
    console.error('Error reading request data:', error);
    return [];
  }
}

export async function getRequests(): Promise<PoemRequest[]> {
  const requests = await readRequestData();
  // Sort by most recent first
  return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addRequest(request: PoemRequest) {
  const currentData = await readRequestData();
  currentData.unshift(request);
  await fs.writeFile(dataFilePath, JSON.stringify(currentData, null, 2));
}
