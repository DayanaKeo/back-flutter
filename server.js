const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { APIToolkit } = require('apitoolkit-express');
const path = require('path');
const Joi = require('joi');
require('dotenv').config()

//DECLARATION ROUTE
const userRouter = require('./route/user');
const roleRouter = require('./route/role');
// const twoFactorRoutes = require('./route/two-factor');
const childRouter = require('./route/childRoute');
const tuteurRouter = require('./route/tuteurRoute');
const contactRouter = require('./route/contactRoute');
const qrcodeRouter = require('./route/qrcodeRoute');

const app = express();
const port = 4000;
const apitoolkitClient = APIToolkit.NewClient({ apiKey: process.env.APITOOLKIT_API_KEY });


app.use(cors());
app.use(apitoolkitClient.expressMiddleware);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')));


//ROUTE USER
app.use('/api/user', userRouter);
// app.use('/api/two-factor', twoFactorRoutes);
app.use('/api/role', roleRouter);
app.use('/api/auth', userRouter );
app.use('/api/child', childRouter);
app.use('/api/tuteur', tuteurRouter);
app.use('/api/contact-urg', contactRouter);
app.use('/qr-code', qrcodeRouter);

app.use(apitoolkitClient.errorHandler);
app.listen( port ,() => {
  console.log(`Server is running on http://localhost:${port}`);
});
