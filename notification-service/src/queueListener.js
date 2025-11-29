const amqp = require("amqplib");
const pool = require("./db"); // ✅ Import correct

async function listenQueue() {
  const connection = await amqp.connect("amqp://user:pass@rabbitmq:5672");
  const channel = await connection.createChannel();

  // Écoute de payment_created
  const paymentQueue = "payment_created";
  await channel.assertQueue(paymentQueue, { durable: true });

  channel.consume(paymentQueue, async (msg) => {
    if (msg !== null) {
      const { data } = JSON.parse(msg.content.toString());
      console.log("📨 Event received: payment_created", data);

      await pool.query(
        `INSERT INTO notifications (user_id, message, type, status)
         VALUES ($1, $2, $3, 'pending')`,
        [data.customer_id, `Votre paiement ${data.transaction_id} de ${data.amount} a été reçu.`, "email"]
      );

      channel.ack(msg);
    }
  });

  // Écoute de shipment_created
  const shipmentQueue = "shipment_created";
  await channel.assertQueue(shipmentQueue, { durable: true });

  channel.consume(shipmentQueue, async (msg) => {
    if (msg !== null) {
      const { data } = JSON.parse(msg.content.toString());
      console.log("📨 Event received: shipment_created", data);

      await pool.query(
        `INSERT INTO notifications (user_id, message, type, status)
         VALUES ($1, $2, $3, 'pending')`,
        [data.customer_id, `Votre commande ${data.order_id} a été expédiée. Numéro de suivi: ${data.tracking_number}`, "email"]
      );

      channel.ack(msg);
    }
  });
}

module.exports = listenQueue;
