const pool = require("../../config/dbConfig");

const createFactura = async (folio, proveedor, image_url) => {
    const client = await pool.connect(); // Obtener una conexión del pool
    
    try {
        // Iniciar una transacción
        await client.query("BEGIN");

        // Consulta SQL parametrizada
        const query = `
            INSERT INTO facturas (folio, proveedor, image_url)
            VALUES ($1, $2, $3);
        `;

        // Valores para la consulta
        const values = [folio, proveedor, image_url];

        // Ejecutar la consulta
        await client.query(query, values);

        // Confirmar la transacción
        await client.query("COMMIT");
    } catch (error) {
        // Revertir la transacción en caso de error
        await client.query("ROLLBACK");
        console.error("Error en createFactura:", error);
        throw error;
    } finally {
        // Liberar la conexión
        client.release();
    }
};

const getFacturaByFolio = async (folio) => {
    const client = await pool.connect(); // Obtener una conexión del pool
    try {
        // Consulta SQL para obtener las facturas por folio
        const query = 'SELECT * FROM facturas WHERE folio = $1';
        const { rows } = await client.query(query, [folio]); // Ejecutar la consulta
        return rows; // Devolver todas las facturas con el mismo folio
    } catch (error) {
        console.error('Error en el modelo al obtener la factura:', error);
        throw error; // Relanzar el error para manejarlo en el controlador
    } finally {
        // Liberar la conexión
        client.release();
    }
};

module.exports = { createFactura, getFacturaByFolio };
