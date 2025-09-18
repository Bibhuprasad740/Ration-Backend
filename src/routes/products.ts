import { Router, Request, Response, NextFunction } from 'express';
import {
  addProduct,
  updateProduct,
  deleteProduct,
  addToFinished,
  removeFromFinished,
  getFinished,
  listProducts,
  getProduct,
} from '../controllers/productController';
import { isValidCollectionName } from '../models/product';

const router = Router();

router.param('productCollection', (req: Request, res: Response, next: NextFunction, value: string) => {
  if (!isValidCollectionName(value)) {
    return res.status(400).json({ error: "productCollection must be 'vegetable' or 'ration'" });
  }
  next();
});

// Optional listing endpoints for convenience
router.get('/:collection/products', listProducts); // tested
router.get('/:collection/products/:id', getProduct); // tested

// Create, update, delete
router.post('/:collection/products', addProduct); // tested
router.put('/:collection/products/:id', updateProduct); // tested
router.delete('/:collection/products/:id', deleteProduct); // tested

// Finished list operations
router.post('/:collection/products/:id/finish', addToFinished);
router.delete('/:collection/products/:id/finish', removeFromFinished);

// Get all finished across collections
router.get('/finished', getFinished);

export default router;
