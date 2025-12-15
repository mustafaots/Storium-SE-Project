import express from 'express';
import productsController from '../controllers/products.controller.js';
import validateProducts from '../middleware/special_validators/validateProducts.js';

// import validateProducts if you have validation middleware

const router = express.Router();

// GET /api/products?page=1&limit=10&search=term
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProductById);

router.delete('/:id', productsController.deleteProduct);

router.post('/', validateProducts, productsController.createProduct);
router.put('/:id', validateProducts, productsController.updateProduct);


export default router;
