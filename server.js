const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { APIToolkit } = require('apitoolkit-express');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Importation des routes
const userRouter = require('./route/user');
const roleRouter = require('./route/role');
const childRouter = require('./route/childRoute');
const tuteurRouter = require('./route/tuteurRoute');
const contactRouter = require('./route/contactRoute');
const qrcodeRouter = require('./route/qrcodeRoute');
const articleRoute = require('./route/boutique/article');

const app = express();
const port = 4000;

const apitoolkitClient = APIToolkit.NewClient({ apiKey: process.env.APITOOLKIT_API_KEY });

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('BDD Boutique connectée');
    // Démarrez le serveur seulement après que la connexion à la base de données soit établie
    startServer();
  })
  .catch(err => console.log("Erreur de connexion à MongoDB:", err));

function startServer() {
  app.use(cors());
  app.use(apitoolkitClient.expressMiddleware);
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use('/public', express.static(path.join(__dirname, 'public')));
  app.use('/uploads', express.static('uploads'));

  // Configuration Swagger
  const options = {
    definition: {
        openapi: "3.1.0",
        info: {
            title: "LogRocket Express API with Swagger",
            version: "0.1.0",
            description:
                "This is a simple CRUD API application made with Express and documented with Swagger",
            license: {
                name: "MIT",
                url: "https://spdx.org/licenses/MIT.html",
            },
            contact: {
                name: "LogRocket",
                url: "https://logrocket.com",
                email: "info@email.com",
            },
        },
        servers: [
            {
                url: "http://localhost:4000",
            },
        ],
    },
    apis: ["./routes/*.js"],
  };
  
  const specs = swaggerJsdoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  // Routes
  app.use('/api/user', userRouter);
  app.use('/api/role', roleRouter);
  app.use('/api/auth', userRouter);
  app.use('/api/child', childRouter);
  app.use('/api/tuteur', tuteurRouter);
  app.use('/api/contact-urg', contactRouter);
  app.use('/qr-code', qrcodeRouter);
  app.use('/boutique', articleRoute);

  app.use(apitoolkitClient.errorHandler);

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}