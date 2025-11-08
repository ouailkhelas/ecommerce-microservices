const express = require('express');
const router = express.Router();

let customers = [
  { id: 1, name: "ali", email: "ali@gmail.com" }
];

router.get('/', (req, res) => {
  res.json(customers);
});

module.exports = router;
