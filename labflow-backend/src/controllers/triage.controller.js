import {
  getCollection,
  getDocument,
  createDocument,
  updateDocument,
} from "../services/firestore.service.js";

export async function listTriages(req, res) {
  let triages = await getCollection("triages");
  const patientId = req.query.patientId;
  if (patientId) {
    triages = triages.filter((t) => t.patientId === patientId);
  }
  return res.json({ triages });
}

export async function createTriage(req, res) {
  const payload = req.body;
  if (!payload.patientId || !payload.bp) {
    return res.status(400).json({ error: "patientId and bp are required" });
  }

  const patient = await getDocument("patients", payload.patientId);
  if (!patient) {
    return res.status(404).json({ error: "Patient not found" });
  }

  const triageData = {
    ...payload,
    category: payload.category || "green",
    queueNumber: payload.queueNumber || "A-000",
    by: payload.by || "Nurse",
  };

  const triage = await createDocument("triages", triageData);

  const patientUpdates = {
    vitals: {
      bp: payload.bp,
      temp: payload.temp || "",
      pulse: payload.pulse || "",
      weight: payload.weight || "",
      height: payload.height || "",
      spo2: payload.spo2 || "",
      bmi: payload.bmi || "",
    },
    triageCategory: triageData.category,
    triageLevel: triageData.level || null,
    status: "triaged",
  };

  const updatedPatient = await updateDocument(
    "patients",
    payload.patientId,
    patientUpdates,
  );
  if (!updatedPatient) {
    return res
      .status(500)
      .json({ error: "Failed to update patient vitals after triage creation" });
  }

  return res.status(201).json({ triage });
}
