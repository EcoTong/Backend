require ('dotenv').config();
const express = require('express'); 
const app = express();

const Router = require('./src/routes/Router');
const { PORT } = process.env;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api', Router);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});