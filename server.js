const express = require('express');
const morgan = require('morgan');
const mainRoutes = require('./app/routes/mainRoutes');

const app = express();
const port = 3000;

app.use(morgan('dev'));
app.use(express.json());

app.use('/api', mainRoutes);

app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
});