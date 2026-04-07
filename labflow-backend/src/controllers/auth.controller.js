import {
  createDocument,
  getCollection,
  queryCollection,
} from "../services/firestore.service.js";
import { generateRoleId } from "../utils/idGenerator.js";

function getCollectionByPrefix(id) {
  if (id.startsWith("DR-")) return "doctors";
  if (id.startsWith("AD-")) return "admins";
  if (id.startsWith("LB-")) return "lab_techs";
  if (id.startsWith("NS-")) return "nurses";
  if (id.startsWith("PT-")) return "patients";
  if (id.startsWith("RC-")) return "receptionists";
  if (id.startsWith("PH-")) return "pharmacies";
  return null;
}

function getRoleFromPrefix(id) {
  if (id.startsWith("DR-")) return "doctor";
  if (id.startsWith("AD-")) return "admin";
  if (id.startsWith("LB-")) return "lab_tech";
  if (id.startsWith("NS-")) return "nurse";
  if (id.startsWith("PT-")) return "patient";
  if (id.startsWith("RC-")) return "receptionist";
  if (id.startsWith("PH-")) return "pharmacy";
  return null;
}

export async function login(req, res) {
  const { id, password } = req.body;
  if (!id || !password) {
    return res.status(400).json({ error: "ID and password are required" });
  }

  const collectionName = getCollectionByPrefix(id);
  let users = [];

  if (collectionName) {
    users = await queryCollection(collectionName, "id", "==", id);
  }

  if (users.length === 0) {
    users = await queryCollection("users", "id", "==", id);
  }

  if (users.length === 0) {
    return res.status(404).json({ error: "User ID not found" });
  }

  const user = users[0];

  if (!user.password) {
    return res
      .status(400)
      .json({ error: "User does not have a password configured" });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: "Incorrect password" });
  }

  const role = user.role || getRoleFromPrefix(id);
  if (!role) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  return res.json({
    user: {
      ...user,
      role,
      id: user.id,
      name: user.name,
      email: user.email || "",
    },
    token: `${user.id}.token`,
  });
}

export async function logout(req, res) {
  // Clear session on backend
  return res.json({
    message: "Logged out successfully",
    sessionCleared: true,
  });
}

export async function registerRoleUser(req, res) {
  const { roleKey, name, email, password } = req.body;
  if (!roleKey || !name || !email || !password) {
    return res
      .status(400)
      .json({ error: "roleKey, name, email, and password are required" });
  }

  const id = generateRoleId(roleKey);
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const user = await createDocument("users", {
    id,
    role: roleKey,
    name,
    email,
    initials,
    createdAt: new Date().toISOString(),
    password,
  });

  return res.status(201).json({ user });
}
