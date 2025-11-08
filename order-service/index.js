const express = require('express');
const app = express();

app.use(express.json());

const orderController = require('./src/orderController');

app.use('/orders', orderController);

app.listen(3001, () => {
  console.log('Order Service running on port 3001');
});
