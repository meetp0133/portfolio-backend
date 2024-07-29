require('dotenv').config('../.env');
require('./connection/db');

const express = require('express');
const app = express();
const fs = require('fs');
const cors = require('cors');
const http = require('http');
const path = require('path');
const https = require('https');
const i18n = require('./i18n/i18n');
const helmet = require('helmet');
const { logger } = require('./helpers/loggerService');

const { PORT, BASE_URL ,ENVIRONMENT ,DB_AUTH_URL } = require('../config/key');

// Cors 
app.use(cors({ origin: '*' }));


// Parse request data to json
app.use(express.json());

server = http.createServer(app)
server.listen(PORT, () => {
    console.log('Server listening on port:', PORT)
});

logger.debug('************************************************************************************************************************************');
logger.debug(`🚀⭐️  ENV: ${ENVIRONMENT}`);
logger.debug(`🚀⭐️  BASEURL: ${BASE_URL}`);
logger.debug(`🚀⭐️  PORT: ${PORT}`);
logger.debug(`🚀⭐️  MONGODB URL: ${DB_AUTH_URL}`);
logger.debug('************************************************************************************************************************************');

// Language file
app.use(i18n);


app.get('/', (req, res) => {
    res.send('Testing from the node service.');
});

// Api routes
const commonRoute = require('./routes/common.routes');
app.use(commonRoute);

const publicDirectory = path.join(__dirname, '../');
app.use(express.static(publicDirectory))

// For security
app.use(helmet());

app.use('*', (req, res, next) => {
    res.status(404).json({
        success: 'false',
        message: 'Page not found',
        error: {
            statusCode: 404,
            message: 'You reached a route that is not defined on this server',
        },
    });
})
