const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');
const upload = require('../utils/excelUtils');
const getProductsController = require('../controllers/getProductsController');

// Ruta para subir archivos
router.post('/upload', upload.single('file'), uploadFile);
router.get('/productos', getProductsController.getAllProductosController);

module.exports = router;