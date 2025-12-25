import express from 'express';
import multer from 'multer';
import productsController from '../controllers/products.controller.js';
import validateProducts from '../middleware/special_validators/validateProducts.js';

// Configure multer to store files in memory as buffers
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
  }
});

const router = express.Router();

// GET /api/products?page=1&limit=10&search=term
router.get('/', productsController.getAllProducts);
router.get('/:id', productsController.getProductById);

router.delete('/:id', productsController.deleteProduct);

router.post('/', upload.single('image'), validateProducts, productsController.createProduct);
router.put('/:id', upload.single('image'), validateProducts, productsController.updateProduct);


export default router;
