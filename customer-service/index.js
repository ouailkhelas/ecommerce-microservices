const express = require('express');
const app = express();
app.use(express.json());

const customerController = require('./src/customerController');

app.use('/customers', customerController);

app.listen(3003, () => {
  console.log('Customer Service running on port 3003');
});
