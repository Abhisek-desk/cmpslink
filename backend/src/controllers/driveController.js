import Drive from "../models/Drive.js";
import { findConflicts } from "../services/schedulingService.js";

export async function createDrive(req, res) {
  const drive = await Drive.create({ ...req.body, recruiterId: req.user.id });
  res.status(201).json(drive);
}

export async function listDrives(req, res) {
  res.json(await Drive.find().sort({ date: 1 }));
}

export async function conflicts(req, res) {
  const drives = await Drive.find();
  res.json(findConflicts(drives));
}
