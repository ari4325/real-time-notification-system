const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/authenticate');
const amqp = require('amqplib/callback_api');

const router = express.Router();


const authenticate = require('../middleware/authenticate');

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: Notification management API
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a new notification for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', authenticate, async (req, res) => {
  const { message } = req.body;
  try {
    const newNotification = new Notification({
      userId: req.user.id,
      message,
    });
    await newNotification.save();

    // Push message to the queue
    amqp.connect(process.env.RABBITMQ_URL, (err, connection) => {
      if (err) throw err;
      connection.createChannel((err, channel) => {
        if (err) throw err;
        const queue = 'notifications';
        channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(newNotification)));
        console.log('Notification sent to queue');
      });
    });

    res.json(newNotification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get all notifications for the authenticated user
 *     tags: [Notifications]
 *     parameters:
 *       - in: header
 *         name: Authorization
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: A list of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   message:
 *                     type: string
 *                   read:
 *                     type: boolean
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id });
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get details of a specific notification
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 userId:
 *                   type: string
 *                 message:
 *                   type: string
 *                 read:
 *                   type: boolean
 *       404:
 *         description: Notification not found
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

/**
 * @swagger
 * /api/notifications/{id}:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       404:
 *         description: Notification not found
 */
router.put('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
