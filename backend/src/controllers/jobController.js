import Job from "../models/Job.js";

export async function createJob(req, res) {
  const job = await Job.create({ ...req.body, recruiterId: req.user.id });
  res.status(201).json(job);
}

export async function listJobs(req, res) {
  res.json(await Job.find().populate("recruiterId", "name email"));
}
