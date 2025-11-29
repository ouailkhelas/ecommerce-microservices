const connectQueue = require("../../queue");

async function sendPaymentCreatedEvent(payment) {
  const channel = await connectQueue();
  const queue = "payment_created";

  await channel.assertQueue(queue, { durable: true });

  channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify({
      event: "payment_created",
      data: payment
    }))
  );

  console.log("📨 Event sent: payment_created");
}

module.exports = sendPaymentCreatedEvent;
