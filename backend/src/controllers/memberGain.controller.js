const MemberGain = require("../models/MemberGain");

async function getPublishedGains(req, res) {
  try {
    const gains = await MemberGain.find({ isPublished: true })
      .sort({ totalReturnPct: -1 })
      .limit(10);
    res.json({ success: true, data: gains });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function adminGetAllGains(req, res) {
  try {
    const gains = await MemberGain.find().sort({ createdAt: -1 });
    res.json({ success: true, data: gains });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function adminCreateGain(req, res) {
  try {
    const gain = await MemberGain.create(req.body);
    res.status(201).json({ success: true, data: gain });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function adminUpdateGain(req, res) {
  try {
    const gain = await MemberGain.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!gain) return res.status(404).json({ success: false, message: "Entry not found" });
    res.json({ success: true, data: gain });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function adminDeleteGain(req, res) {
  try {
    const gain = await MemberGain.findByIdAndDelete(req.params.id);
    if (!gain) return res.status(404).json({ success: false, message: "Entry not found" });
    res.json({ success: true, data: gain });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function adminTogglePublish(req, res) {
  try {
    const gain = await MemberGain.findById(req.params.id);
    if (!gain) return res.status(404).json({ success: false, message: "Entry not found" });

    gain.isPublished = !gain.isPublished;
    if (gain.isPublished) gain.publishedAt = new Date();
    await gain.save();

    res.json({ success: true, data: gain });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  getPublishedGains,
  adminGetAllGains,
  adminCreateGain,
  adminUpdateGain,
  adminDeleteGain,
  adminTogglePublish,
};
