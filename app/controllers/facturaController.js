const fs = require("fs");
const path = require("path");
const sharp = require('sharp');
const {
  createFactura,
  getFacturaByFolio,
} = require("../models/facturaModel");
const { uploadToDrive } = require("../utils/googleDriveUtils");

// Subir factura a Google Drive y guardar en la base de datos
const uploadFactura = async (req, res) => {
  try {
    const file = req.file;
    const { folio, proveedor } = req.body;

    if (!file || !folio) {
      return res.status(400).json({ message: "Falta imagen o folio" });
    }

    // Renombrar el archivo
    const newFileName = `${folio}${path.extname(file.originalname)}`;
    const newFilePath = path.join(path.dirname(file.path), newFileName);

    // Mover el archivo al nuevo nombre
    fs.renameSync(file.path, newFilePath);

    // Comprimir la imagen antes de subirla
    const compressedFilePath = path.join(path.dirname(newFilePath), `compressed_${newFileName}`);
    console.time("Compresión de Imagen");
    await sharp(newFilePath)
      .resize({ width: 1024 }) // Ajustar tamaño
      .jpeg({ quality: 50 }) // Reducir calidad
      .toFile(compressedFilePath);
    console.timeEnd("Compresión de Imagen");

    // Subir a Google Drive en la subcarpeta del proveedor
    console.time("Subida a Google Drive");
    const driveFile = await uploadToDrive(compressedFilePath, newFileName, proveedor);
    console.timeEnd("Subida a Google Drive");

    // Guardar en PostgreSQL
    const factura = await createFactura(folio, proveedor, driveFile.url);

    // Eliminar archivos temporales
    fs.unlinkSync(newFilePath);
    fs.unlinkSync(compressedFilePath);

    res.status(201).json({ message: "Factura subida con éxito", factura });
  } catch (error) {
    console.error("Error en uploadFactura:", error);
    res.status(500).json({ message: "Error al subir la factura", error });
  }
};

// Obtener una factura por folio
const getFactura = async (req, res) => {
  try {
    const { folio } = req.params;
    const facturas = await getFacturaByFolio(folio);

    if (!facturas || facturas.length === 0) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }

    res.json(facturas);
  } catch (error) {
    console.error("Error en getFactura:", error);
    res.status(500).json({ message: "Error al obtener la factura" });
  }
};

module.exports = {
  uploadFactura,
  getFactura,
};