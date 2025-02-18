const { getAllProductos } = require('../models/productoModel');

const getAllProductosController = async (req, res) => {
  try {
    const productos = await getAllProductos();
    res.status(200).json(productos);
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los productos' });
  }
};

module.exports = { getAllProductosController };