const amqp = require("amqplib");

async function connectQueue() {
  const connection = await amqp.connect("amqp://user:pass@rabbitmq:5672");
  const channel = await connection.createChannel();
  return channel;
}

module.exports = connectQueue;
