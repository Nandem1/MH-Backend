const fs = require("fs");
const path = require("path");
const {
  createOrUpdateFactura,
  getFacturaByFolio,
} = require("../models/facturaModel");
const { uploadToDrive } = require("../utils/googleDriveUtils");

// Subir factura a Google Drive y guardar en la base de datos
const uploadFactura = async (req, res) => {
  try {
    const file = req.file;
    const { folio, proveedor } = req.body;

    if (!file || !folio || !proveedor) {
      return res
        .status(400)
        .json({ message: "Falta imagen, folio o proveedor" });
    }

    // Renombrar el archivo
    const newFileName = `[${folio}_${proveedor}]${path.extname(
      file.originalname
    )}`;
    const newFilePath = path.join(path.dirname(file.path), newFileName);

    // Mover el archivo al nuevo nombre
    fs.renameSync(file.path, newFilePath);

    // Subir a Google Drive
    const driveFile = await uploadToDrive(newFilePath, newFileName);

    // Guardar en PostgreSQL
    const factura = await createOrUpdateFactura(
      folio,
      proveedor,
      driveFile.url
    );

    // Eliminar archivo local después de subirlo
    fs.unlinkSync(newFilePath);

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
    const factura = await getFacturaByFolio(folio);

    if (!factura) {
      return res.status(404).json({ message: "Factura no encontrada" });
    }

    res.json(factura);
  } catch (error) {
    console.error("Error en getFactura:", error);
    res.status(500).json({ message: "Error al obtener la factura" });
  }
};

module.exports = {
  uploadFactura,
  getFactura,
};
