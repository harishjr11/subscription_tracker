import axiosInstance from "./axiosInstance";

export const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get( "http://localhost:5500/api/v1/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};
