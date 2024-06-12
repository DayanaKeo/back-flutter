const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRouter = require('./route/user');
const sequelize = require('./models/User');


const app = express();
const port = 4000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api/user', userRouter);

// app.listen(port, () => {
//   console.log(`Server is running on http://localhost:${port}`);
// });

sequelize.sync({ force: true }).then(() => {
  console.log(`Server is running on http://localhost:${port}`);
  // Votre serveur commence ici
});