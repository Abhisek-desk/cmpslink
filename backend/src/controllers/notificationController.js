import Notification from "../models/Notification.js";

export async function listNotifications(req, res) {
  res.json(await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 }));
}

export async function createNotification(req, res) {
  res.status(201).json(await Notification.create(req.body));
}
