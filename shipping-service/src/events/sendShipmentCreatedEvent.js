const connectQueue = require("../../queue");

async function sendShipmentCreatedEvent(shipment) {
  const channel = await connectQueue();
  const queue = "shipment_created";

  await channel.assertQueue(queue, { durable: true });

  channel.sendToQueue(
    queue,
    Buffer.from(JSON.stringify({
      event: "shipment_created",
      data: shipment
    }))
  );

  console.log("📨 Event sent: shipment_created");
}

module.exports = sendShipmentCreatedEvent;
