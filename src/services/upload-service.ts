import { endpoints } from "../constant/constant";
import api from "../utils/axios";

interface UploadResponse {
  files: {
    url: string;
    public_id: string;
    originalName: string;
  }[];
  message: string;
}

export const UploadFiles = async (files: File[]): Promise<UploadResponse> => {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post<UploadResponse>(
    endpoints.upload,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data; 
};