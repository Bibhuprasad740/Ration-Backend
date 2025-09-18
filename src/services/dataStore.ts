import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import { Product, Collection } from '../models/product';

interface DatabaseShape {
  vegetable: Product[];
  ration: Product[];
}

const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.resolve(DATA_DIR, 'db.json');

let db: DatabaseShape | null = null;

function ensureCollectionName(collection: string): collection is Collection {
  return collection === 'vegetable' || collection === 'ration';
}

export async function init(): Promise<void> {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    const initial: DatabaseShape = { vegetable: [], ration: [] };
    await fsp.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
  const content = await fsp.readFile(DATA_FILE, 'utf-8');
  db = JSON.parse(content) as DatabaseShape;
}

async function persist(): Promise<void> {
  if (!db) throw new Error('Database not initialized');
  await fsp.writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function getCollectionRef(collection: Collection): Product[] {
  if (!db) throw new Error('Database not initialized');
  return db[collection];
}

export function listProducts(collection: Collection): Product[] {
  return [...getCollectionRef(collection)];
}

export function getProduct(collection: Collection, id: string): Product | undefined {
  return getCollectionRef(collection).find(p => p.id === id);
}

export async function addProduct(collection: Collection, data: { name: string; imageUrl: string; }): Promise<Product> {
  const newProduct: Product = {
    id: randomUUID(),
    name: data.name,
    imageUrl: data.imageUrl,
    addedToFinishedList: false,
  };
  const col = getCollectionRef(collection);
  col.push(newProduct);
  await persist();
  return newProduct;
}

export async function updateProduct(collection: Collection, id: string, patch: Partial<Pick<Product, 'name' | 'imageUrl'>>): Promise<Product | null> {
  const col = getCollectionRef(collection);
  const idx = col.findIndex(p => p.id === id);
  if (idx === -1) return null;
  col[idx] = { ...col[idx], ...patch };
  await persist();
  return col[idx];
}

export async function deleteProduct(collection: Collection, id: string): Promise<boolean> {
  const col = getCollectionRef(collection);
  const before = col.length;
  const next = col.filter(p => p.id !== id);
  if (next.length === before) return false;
  db![collection] = next;
  await persist();
  return true;
}

export async function setFinished(collection: Collection, id: string, finished: boolean): Promise<Product | null> {
  const col = getCollectionRef(collection);
  const idx = col.findIndex(p => p.id === id);
  if (idx === -1) return null;
  col[idx] = { ...col[idx], addedToFinishedList: finished };
  await persist();
  return col[idx];
}

export function getAllFinished(): Array<Product & { collection: Collection } > {
  if (!db) throw new Error('Database not initialized');
  const result: Array<Product & { collection: Collection }> = [];
  (['vegetable', 'ration'] as const).forEach((c) => {
    db![c].forEach(p => { if (p.addedToFinishedList) result.push({ ...p, collection: c }); });
  });
  return result;
}

export { ensureCollectionName };
