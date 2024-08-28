// app/api/userApi.ts
import axios from "axios";

const API_URL = "http://localhost:8080";

export const getUsers = async (searchTerm: string) => {
  const response = await axios.get(`${API_URL}/users`, {
    params: {
      query: searchTerm, // Sending the search term as a query parameter
    },
  });
  console.log(response.data);
  return response.data;
};


// getUsers();

export const addUser = async (formData: FormData) => {
  try {
    const response = await axios.post(`${API_URL}/users`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

export const deleteUser = async (id: any) => {
  const response = await axios.delete(`${API_URL}/users/${id}`);
  console.log(response.data);
  return response.data;
};
