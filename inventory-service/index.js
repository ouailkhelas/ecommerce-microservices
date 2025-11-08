const express = require('express');
const app = express();
app.use(express.json());

const inventoryController = require('./src/inventoryController');

app.use('/inventory', inventoryController);

app.listen(3002, () => {
  console.log('Inventory Service running on port 3002');
});
