const XLSX = require('xlsx');
const { createOrUpdateProducto } = require('../models/productoModel');
const upload = require('../utils/excelUtils');
const fs = require('fs');
const path = require('path');

const uploadFile = async (req, res) => {
    try {
        // Verificar si se subió un archivo
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo' });
        }

        // Leer el archivo Excel
        const workbook = XLSX.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        //console.log(data)
        //console.log("console despues de data")

        // Procesar los datos en lotes
        const batchSize = 100; // Tamaño del lote
        const batches = [];
        for (let i = 0; i < data.length; i += batchSize) {
            batches.push(data.slice(i, i + batchSize));
        }

        // Insertar/actualizar los productos en la base de datos
        for (const batch of batches) {
            await createOrUpdateProducto(batch);
        }

        // Eliminar el archivo después de procesarlo
        fs.unlinkSync(req.file.path);

        res.status(200).json({ message: 'Archivo subido y datos actualizados correctamente' });
    } catch (error) {
        console.error('Error al procesar el archivo:', error);

        // Eliminar el archivo en caso de error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({ error: 'Ocurrió un error al procesar el archivo' });
    }
};

module.exports = { uploadFile };