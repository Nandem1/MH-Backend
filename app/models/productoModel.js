const pool = require("../../config/dbConfig");

const createOrUpdateProducto = async (productos) => {
  const client = await pool.connect(); // Obtener una conexión del pool

  try {
    // Iniciar una transacción
    await client.query("BEGIN");

    // Iterar sobre cada producto
    for (const producto of productos) {
      const {
        codigo,
        nombre,
        unidad,
        precio,
        codigo_barra_interno,
        codigo_barra_externo,
        descripcion,
        es_servicio,
        es_exento,
        impuesto_especifico,
        id_categoria,
        disponible_para_venta,
        activo,
        utilidad,
        tipo_utilidad,
      } = producto;

      // Consulta SQL parametrizada
      const query = `
                INSERT INTO productos (
                    codigo, nombre, unidad, precio, codigo_barra_interno, codigo_barra_externo,
                    descripcion, es_servicio, es_exento, impuesto_especifico, id_categoria,
                    disponible_para_venta, activo, utilidad, tipo_utilidad
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                ON CONFLICT (codigo) DO UPDATE
                SET
                    nombre = EXCLUDED.nombre,
                    unidad = EXCLUDED.unidad,
                    precio = EXCLUDED.precio,
                    codigo_barra_interno = EXCLUDED.codigo_barra_interno,
                    codigo_barra_externo = EXCLUDED.codigo_barra_externo,
                    descripcion = EXCLUDED.descripcion,
                    es_servicio = EXCLUDED.es_servicio,
                    es_exento = EXCLUDED.es_exento,
                    impuesto_especifico = EXCLUDED.impuesto_especifico,
                    id_categoria = EXCLUDED.id_categoria,
                    disponible_para_venta = EXCLUDED.disponible_para_venta,
                    activo = EXCLUDED.activo,
                    utilidad = EXCLUDED.utilidad,
                    tipo_utilidad = EXCLUDED.tipo_utilidad;
            `;

      // Valores para la consulta
      const values = [
        codigo,
        nombre,
        unidad,
        precio && !isNaN(precio) ? parseFloat(precio) : null, // Convertir a número o null
        codigo_barra_interno || null,
        codigo_barra_externo || null,
        descripcion || null,
        es_servicio === 'Si', // Convertir a booleano
        es_exento === 'Si', // Convertir a booleano
        impuesto_especifico && !isNaN(impuesto_especifico) ? parseFloat(impuesto_especifico) : null, // Convertir a número o null
        id_categoria && !isNaN(parseInt(id_categoria)) ? parseInt(id_categoria) : null, // Convertir a número o null
        disponible_para_venta === 'Si', // Convertir a booleano
        activo === 'Si', // Convertir a booleano
        utilidad && !isNaN(utilidad) ? parseFloat(utilidad) : null, // Convertir a número o null
        tipo_utilidad || null // Cadena o null
    ];

      // Ejecutar la consulta
      //console.log('Valores a insertar/actualizar:', values);
      await client.query(query, values);
    }

    // Confirmar la transacción
    await client.query("COMMIT");
  } catch (error) {
    // Revertir la transacción en caso de error
    await client.query("ROLLBACK");
    console.error("Error en createOrUpdateProducto:", error);
    throw error;
  } finally {
    // Liberar la conexión
    client.release();
  }
};

const getAllProductos = async () => {
  const client = await pool.connect(); // Obtener una conexión del pool
  try {
    // Consulta SQL para obtener todos los productos
    const query = 'SELECT * FROM productos'; // Ajusta el nombre de la tabla si es necesario
    const { rows } = await client.query(query); // Ejecutar la consulta
    return rows; // Devolver los resultados
  } catch (error) {
    console.error('Error en el modelo al obtener los productos:', error);
    throw error; // Relanzar el error para manejarlo en el controlador
  } finally {
    // Liberar la conexión
    client.release();
  }
};


module.exports = { createOrUpdateProducto, getAllProductos };
