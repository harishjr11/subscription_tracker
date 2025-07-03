import axiosInstance from "./axiosInstance";

export const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users`);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const apiUrl = (path) => `${import.meta.env.VITE_BACKEND_URL}${path}`;
