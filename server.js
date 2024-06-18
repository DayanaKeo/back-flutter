const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config()

//DECLARATION ROUTE
const userRouter = require('./route/user');
const roleRouter = require('./route/role');
const twoFactorRoutes = require('./route/two-factor');

const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//ROUTE USER
app.use('/api/user', userRouter);
app.use('/api/two-factor', twoFactorRoutes);
app.use('/api/role', roleRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
