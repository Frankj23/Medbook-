import {
  getCollection,
  getDocument,
  createDocument,
  updateDocument,
} from "../services/firestore.service.js";

export async function listConsultations(req, res) {
  const patientId = req.query.patientId;
  const doctorId = req.query.doctorId;
  let consultations = await getCollection("consultations");
  if (patientId) {
    consultations = consultations.filter((c) => c.patientId === patientId);
  }
  if (doctorId) {
    consultations = consultations.filter((c) => c.doctorId === doctorId);
  }
  return res.json({ consultations });
}

export async function getConsultationById(req, res) {
  const { id } = req.params;
  const consultation = await getDocument("consultations", id);
  if (!consultation) {
    return res.status(404).json({ error: "Consultation not found" });
  }
  return res.json({ consultation });
}

export async function createConsultation(req, res) {
  const payload = req.body;
  if (!payload.patientId || !payload.symptoms) {
    return res
      .status(400)
      .json({ error: "patientId and symptoms are required" });
  }
  const consultation = await createDocument("consultations", {
    ...payload,
    status: payload.status || "lab_requested",
    doctorId: payload.doctorId || null,
    doctorName: payload.doctorName || "Unknown Doctor",
  });
  return res.status(201).json({ consultation });
}

export async function updateConsultation(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const consultation = await updateDocument("consultations", id, updates);
  if (!consultation) {
    return res.status(404).json({ error: "Consultation not found" });
  }
  return res.json({ consultation });
}
