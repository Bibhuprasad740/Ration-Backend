import { Request, Response } from 'express';
import { z } from 'zod';
import Product, { ProductCollection } from '../models/product';

const createSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().url(),
});

const updateSchema = z
  .object({
    name: z.string().min(1).optional(),
    imageUrl: z.string().url().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field must be provided' });

export async function listProducts(req: Request, res: Response) {
  const productCollection = req.params.collection as ProductCollection;
  const items = await Product.find({ productCollection }).exec();
  res.json(items);
}

export async function getProduct(req: Request, res: Response) {
  const productCollection = req.params.collection as ProductCollection;
  const { id } = req.params;
  try {
    const item = await Product.findOne({ _id: id, productCollection }).exec();
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err: any) {
    if (err?.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
    throw err;
  }
}

export async function addProduct(req: Request, res: Response) {
  const productCollection = req.params.collection as ProductCollection;
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const created = await Product.create({ ...parsed.data, productCollection, addedToFinishedList: false });
  res.status(201).json(created);
}

export async function updateProduct(req: Request, res: Response) {
  const productCollection = req.params.collection as ProductCollection;
  const { id } = req.params;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const updated = await Product.findOneAndUpdate({ _id: id, productCollection }, parsed.data, { new: true }).exec();
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err: any) {
    if (err?.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
    throw err;
  }
}

export async function deleteProduct(req: Request, res: Response) {
  const productCollection = req.params.collection as ProductCollection;
  const { id } = req.params;
  try {
    const deleted = await Product.findOneAndDelete({ _id: id, productCollection }).exec();
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err: any) {
    if (err?.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
    throw err;
  }
}

export async function addToFinished(req: Request, res: Response) {
  const productCollection = req.params.collection as ProductCollection;
  const { id } = req.params;
  try {
    const updated = await Product.findOneAndUpdate(
      { _id: id, productCollection },
      { $set: { addedToFinishedList: true } },
      { new: true }
    ).exec();
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err: any) {
    if (err?.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
    throw err;
  }
}

export async function removeFromFinished(req: Request, res: Response) {
  const productCollection = req.params.collection as ProductCollection;
  const { id } = req.params;
  try {
    const updated = await Product.findOneAndUpdate(
      { _id: id, productCollection },
      { $set: { addedToFinishedList: false } },
      { new: true }
    ).exec();
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err: any) {
    if (err?.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
    throw err;
  }
}

export async function getFinished(_req: Request, res: Response) {
  const items = await Product.find({ addedToFinishedList: true }).exec();
  res.json(items);
}
