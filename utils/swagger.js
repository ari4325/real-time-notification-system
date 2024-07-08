const swaggerJsDoc = require('swagger-jsdoc');
const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'Notification System API',
        version: '1.0.0',
        description: 'API for Notification System'
      },
      servers: [
        {
          url: 'http://localhost:3000',
          description: 'Local server'
        }
      ]
    },
    apis: ['./routes/*.js'] 
};
const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;