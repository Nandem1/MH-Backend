const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear la carpeta "uploads" si no existe
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Guarda los archivos en la carpeta "uploads"
    },
    filename: function (req, file, cb) {
        // Nombre del archivo: campo-originalname-timestamp.ext
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Aceptar archivos .xlsx y .xls
    if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || // .xlsx
        file.mimetype === 'application/vnd.ms-excel' // .xls
    ) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos Excel (.xlsx o .xls)'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 20 // Límite de 20MB
    }
});

module.exports = upload;