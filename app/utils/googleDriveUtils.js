const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
    keyFile: 'google-service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID;

async function uploadToDrive(filePath, fileName) {
    try {
        // Subir archivo a Google Drive
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
            fields: 'id'
        });

        const fileId = response.data.id;

        // Hacer la imagen pública
        await drive.permissions.create({
            fileId: fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone'
            }
        });

        // Generar URL pública accesible sin permisos
        const publicUrl = `https://drive.google.com/uc?id=${fileId}`;

        return { id: fileId, url: publicUrl };
    } catch (error) {
        console.error('Error al subir archivo a Google Drive:', error);
        throw new Error('Error al subir archivo a Google Drive');
    }
}

module.exports = {
    uploadToDrive
};

