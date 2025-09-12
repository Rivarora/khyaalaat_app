import type { PoemRequest } from './definitions';
import { promises as fs } from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'requests.json');

async function readRequestData(): Promise<PoemRequest[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    const data = JSON.parse(fileContent);
    // Ensure all requests have a 'completed' field
    return data.map((req: any) => ({ ...req, completed: req.completed ?? false }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.writeFile(dataFilePath, JSON.stringify([]));
      return [];
    }
    console.error('Error reading request data:', error);
    return [];
  }
}

async function writeRequestData(data: PoemRequest[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

export async function getRequests(): Promise<PoemRequest[]> {
  const requests = await readRequestData();
  // Sort by most recent first
  return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addRequest(request: PoemRequest) {
  const currentData = await readRequestData();
  currentData.unshift(request);
  await writeRequestData(currentData);
}

export async function updateRequestStatus(id: string, completed: boolean): Promise<void> {
  const requests = await readRequestData();
  const updatedRequests = requests.map(req => 
    req.id === id ? { ...req, completed } : req
  );
  await writeRequestData(updatedRequests);
}

export async function deleteRequestById(id: string): Promise<void> {
  let requests = await readRequestData();
  requests = requests.filter(req => req.id !== id);
  await writeRequestData(requests);
}
