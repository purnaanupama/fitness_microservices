const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');
const { pool, testConnection } = require('./db');
const reportRoutes = require('./routes/reportRoutes');
const { processAndSaveReport } = require('./controllers/reportController');
const { registerWithEureka } = require('./eurekaClient'); // Import Eureka setup

const app = express();
const PORT = 3000;

// Test DB Connection
testConnection()
  .then(connected => {
    if (connected) {
      console.log('Database connection established successfully');
    } else {
      console.error('Failed to connect to database');
    }
  });

const RABBITMQ_URL = 'amqp://localhost';
const REPORT_QUEUE = 'report.queue';
const REPORT_EXCHANGE = 'report.exchange';
const REPORT_ROUTING_KEY = 'report.tracking';

async function startListener() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    
    // Setup report queue
    await channel.assertExchange(REPORT_EXCHANGE, 'direct', { durable: true });
    await channel.assertQueue(REPORT_QUEUE, { durable: true });
    await channel.bindQueue(REPORT_QUEUE, REPORT_EXCHANGE, REPORT_ROUTING_KEY);

    console.log('Report Service waiting for messages...');

    channel.consume(REPORT_QUEUE, async (msg) => {
      if (msg !== null) {
        try {
          const activity = JSON.parse(msg.content.toString());
          console.log('Received activity for report:', activity);

          await processAndSaveReport(activity);

          channel.ack(msg);
          console.log('Report processed and saved successfully for activity:', activity.id);
        } catch (error) {
          console.error('Error processing report:', error);
          channel.nack(msg, false, false);
        }
      }
    });

    app.use('/api', reportRoutes);

    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
    });

    connection.on('close', () => {
      console.log('RabbitMQ connection closed');
    });
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
    setTimeout(startListener, 5000); // Retry
  }
}

startListener();

// Start Express server
app.listen(PORT, () => {
  console.log(`Report Service listening at http://localhost:${PORT}`);
  registerWithEureka(); // Eureka registration after app starts
});
