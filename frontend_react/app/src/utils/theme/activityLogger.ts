import axios from "axios";

export const logActivity = async (action: string, module: string, details: Record<string, any> = {}) => {
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  if (!userId || !token) {
    console.error("Missing userId or token");
    return;
  }
  const startTime = localStorage.getItem("startTime") ? parseInt(localStorage.getItem("startTime")!, 10) : Date.now();
  const duration = Math.max(1, Math.floor((Date.now() - startTime) / 1000)); // Minimum 1 seconde
  const sanitizedDetails = Object.fromEntries(
    Object.entries(details).filter(([_, v]) => v !== undefined && typeof v !== "function")
  );
  const payload = { userId, action, module, duration, details: sanitizedDetails };
  console.log("Payload:", payload); // Débogage
  try {
    const response = await axios.post("http://localhost:8000/activity/log", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Activity logged successfully:", response.data);
  } catch (error: any) {
    if (error.response) {
      console.error("Server responded with error:", error.response.status, error.response.data);
      if (error.response.data.detail) {
        console.error("Validation errors:", error.response.data.detail);
      }
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
  }
};

export const setStartTime = () => {
  localStorage.setItem("startTime", Date.now().toString());
};

export const clearStartTime = () => {
  localStorage.removeItem("startTime");
};