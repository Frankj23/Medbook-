import { createContext, useContext, useState } from "react";
import { loginUser as apiLoginUser } from "../services/client";
import toast from "react-hot-toast";

export const ROLES = {
  receptionist: {
    id: "RC-0001",
    name: "Amara Diallo",
    title: "Receptionist",
    initials: "AD",
    color: "#0b6e6e",
    home: "/register",
  },
  doctor: {
    id: "DR-1024",
    name: "Dr. Sarah Jenkins",
    title: "General Physician",
    initials: "SJ",
    color: "#005454",
    home: "/doctor/dashboard",
  },
  lab_tech: {
    id: "LB-7431",
    name: "Alex Rivera",
    title: "Lab Technician",
    initials: "AR",
    color: "#1a5c5c",
    home: "/lab/desktop/queue",
  },
  admin: {
    id: "AD-0001",
    name: "John Mensah",
    title: "System Administrator",
    initials: "JM",
    color: "#004545",
    home: "/admin",
  },
  nurse: {
    id: "NS-4521",
    name: "Patricia Wilson",
    title: "Registered Nurse",
    initials: "PW",
    color: "#005454",
    home: "/nurse/triage",
  },
  patient: {
    id: "PT-0001",
    name: "Robert Johnson",
    title: "Patient",
    initials: "RJ",
    color: "#005454",
    home: "/",
  },
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("labflow_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = async (id, password) => {
    try {
      const response = await apiLoginUser(id, password);
      const userData = response.user;
      const token = response.token;
      const roleData = ROLES[userData.role];

      if (!roleData) {
        toast.error("Invalid user role detected");
        throw new Error("Invalid user role");
      }

      const u = { ...roleData, ...userData, roleKey: userData.role, token };
      localStorage.setItem("labflow_user", JSON.stringify(u));
      localStorage.setItem("labflow_token", token);
      setUser(u);
      toast.success(`Login successful! Welcome ${u.name}`);
      return u;
    } catch (error) {
      const errorMessage = error.message || "Login failed";

      if (
        errorMessage.includes("User ID not found") ||
        errorMessage.includes("404")
      ) {
        toast.error("User ID not found in the system");
      } else if (
        errorMessage.includes("Incorrect password") ||
        errorMessage.includes("401")
      ) {
        toast.error("Incorrect password");
      } else if (
        errorMessage.includes("Invalid ID format") ||
        errorMessage.includes("400")
      ) {
        toast.error(
          "Invalid ID format. Please use formats like DR-1024, AD-0001, etc.",
        );
      } else {
        toast.error("Login failed. Please try again.");
      }

      throw error;
    }
  };

  const logout = () => {
    // Clear auth data
    localStorage.removeItem("labflow_user");
    localStorage.removeItem("labflow_token");

    // Clear offline cache data
    localStorage.removeItem("labflow_offline_cache_v1");
    localStorage.removeItem("labflow_pending_ops_v1");

    // Clear any session data
    sessionStorage.clear();

    setUser(null);
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
