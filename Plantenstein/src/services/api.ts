/**
 * API Service for Dr. Planteinstein
 * Central file for all communication with the backend server.
 */

// ─── Change this to your machine's local IP when testing on a physical device ──
// e.g. "http://192.168.1.10:3000" — NOT localhost (device can't reach your PC)
const BASE_URL = "http://localhost:3000/api";

export type AnalysisResult = {
  _id: string;
  title: string;
  cropName: string;
  cropScientific: string;
  status: "healthy" | "warning" | "critical" | "severe" | "soil";
  confidence: number;
  imageUrl: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  analysis: {
    description: string;
    remedies: string;
    prevention: string[];
    soilHealth: string;
  };
  scannedAt: string;
};

export type RecordsResponse = {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: AnalysisResult[];
};

/**
 * Upload a leaf image for disease analysis.
 * Optionally attach GPS coordinates.
 */
export const analyzeLeaf = async (
  imageUri: string,
  location?: { latitude: number; longitude: number }
): Promise<AnalysisResult> => {
  const formData = new FormData();

  // Append the image file
  const filename = imageUri.split("/").pop() ?? "leaf.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  formData.append("image", {
    uri: imageUri,
    name: filename,
    type,
  } as any);

  // Attach location if available
  if (location) {
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
  }

  const response = await fetch(`${BASE_URL}/analyze`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      "Content-Type": "multipart/form-data",
    },
  });

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Analysis failed.");
  }

  return json.data as AnalysisResult;
};

/**
 * Fetch all field records, optionally filtered by status.
 */
export const getRecords = async (
  status?: string,
  page: number = 1
): Promise<RecordsResponse> => {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.append("status", status);

  const response = await fetch(`${BASE_URL}/records?${params.toString()}`);
  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Failed to fetch records.");
  }

  return json as RecordsResponse;
};

/**
 * Fetch a single record by its ID.
 */
export const getRecordById = async (id: string): Promise<AnalysisResult> => {
  const response = await fetch(`${BASE_URL}/records/${id}`);
  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Record not found.");
  }

  return json.data as AnalysisResult;
};

/**
 * Delete a record by its ID.
 */
export const deleteRecord = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/records/${id}`, {
    method: "DELETE",
  });
  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Failed to delete record.");
  }
};
