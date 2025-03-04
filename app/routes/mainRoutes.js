const express = require('express');
const router = express.Router();
const { uploadFile } = require('../controllers/uploadController');
const { uploadFactura, getFactura } = require('../controllers/facturaController');
const upload = require('../utils/excelUtils');
const getProductsController = require('../controllers/getProductsController');
const multer = require('multer');

// Configuración de multer para imágenes de facturas
const facturaUpload = multer({ dest: 'uploads/' });

// Ruta para subir archivos generales
router.post('/upload', upload.single('file'), uploadFile);

// Ruta para obtener productos
router.get('/productos', getProductsController.getAllProductosController);

// Ruta para subir facturas
router.post('/uploadFactura', facturaUpload.single('factura'), uploadFactura);

// Ruta para obtener una factura por folio
router.get('/facturas/:folio', getFactura);

module.exports = router;