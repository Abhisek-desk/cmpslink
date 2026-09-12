import Offer from "../models/Offer.js";

export async function createOffer(req, res) {
  res.status(201).json(await Offer.create({ ...req.body, recruiterId: req.user.id }));
}

export async function listOffers(req, res) {
  const filter = req.user.role === "recruiter" ? { recruiterId: req.user.id } : {};
  res.json(await Offer.find(filter).populate("studentId"));
}

export async function updateOffer(req, res) {
  const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(offer);
}
