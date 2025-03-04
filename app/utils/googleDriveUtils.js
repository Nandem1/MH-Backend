const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

// Configurar la autenticación con Google Drive
const auth = new google.auth.GoogleAuth({
    keyFile: 'google-service-account.json', // Ruta al archivo JSON de la cuenta de servicio
    scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID; // ID de la carpeta en Google Drive

async function uploadToDrive(filePath, fileName) {
    try {
        const fileMetadata = {
            name: fileName,
            parents: [FOLDER_ID]
        };
        const media = {
            mimeType: 'image/jpeg',
            body: fs.createReadStream(filePath)
        };
        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webViewLink, webContentLink'
        });
        return response.data;
    } catch (error) {
        console.error('Error al subir archivo a Google Drive:', error);
        throw new Error('Error al subir archivo a Google Drive');
    }
}

module.exports = {
    uploadToDrive
};
