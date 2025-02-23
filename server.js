const express = require('express');
const morgan = require('morgan');
const uploadRoutes = require('./app/routes/uploadRoutes');

const app = express();
const port = 3000;

// Middleware para registro de solicitudes
app.use(morgan('dev'));

app.use(express.json());
app.use('/api', uploadRoutes);

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});