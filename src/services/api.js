import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getImages = async () => {
  try {
    const response = await api.get("/api/images");
    return response.data.map((item) => ({
      id: item.id,
      image_url: item.image_url,
    }));
  } catch (error) {
    console.error("Error fetching images", error);
    throw new Error("Failed to load images. Please try again.");
  }
};

export const saveAnnotation = async ({ image, label, x, y, width, height }) => {
  try {
    const response = await api.post("/api/annotations/", {
      image, // Ensure this matches the image ID from backend
      label, // Label, e.g., "Dog"
      x: parseFloat(x), // Ensure it's a number
      y: parseFloat(y), // Ensure it's a number
      width: parseFloat(width), // Ensure it's a number
      height: parseFloat(height), // Ensure it's a number
    });
    return response.data;
  } catch (error) {
    console.error("Error saving annotation:", error);
    throw new Error("Failed to save annotation. Please try again.");
  }
};
