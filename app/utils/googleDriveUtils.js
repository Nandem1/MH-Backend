const fs = require('fs');
const { google } = require('googleapis');
require('dotenv').config();

const auth = new google.auth.GoogleAuth({
    keyFile: 'google-service-account.json',
    scopes: ['https://www.googleapis.com/auth/drive']
});

const drive = google.drive({ version: 'v3', auth });
const MAIN_FOLDER_ID = process.env.GOOGLE_DRIVE_MAIN_FOLDER_ID; // ID de "MH_FACTURAS"

// Función para buscar o crear una subcarpeta dentro de la carpeta principal
async function getOrCreateSubfolder(proveedor) {
    try {
        const query = `'${MAIN_FOLDER_ID}' in parents and name='${proveedor}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const res = await drive.files.list({ q: query, fields: 'files(id)' });

        if (res.data.files.length > 0) {
            return res.data.files[0].id; // Si ya existe, devolver el ID
        }

        // Si no existe, crear la subcarpeta
        const folderMetadata = {
            name: proveedor,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [MAIN_FOLDER_ID]
        };

        const folder = await drive.files.create({
            resource: folderMetadata,
            fields: 'id'
        });

        return folder.data.id;
    } catch (error) {
        console.error(`Error creando/buscando la subcarpeta para ${proveedor}:`, error);
        throw new Error('No se pudo gestionar la subcarpeta en Google Drive');
    }
}

// Función para subir archivos a la subcarpeta correspondiente
async function uploadToDrive(filePath, fileName, proveedor) {
    try {
        // Si no se proporciona un proveedor, se guarda en la carpeta principal
        const parentFolderId = proveedor ? await getOrCreateSubfolder(proveedor) : MAIN_FOLDER_ID;

        const fileMetadata = {
            name: fileName,
            parents: [parentFolderId]
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
