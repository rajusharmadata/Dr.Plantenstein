/**
 * API Service for Dr. Planteinstein
 * Central file for all communication with the backend server.
 */

import Constants from "expo-constants";
import { getAuthToken } from "./authStorage";

// ─── Change this to your machine's local IP when testing on a physical device ──
// e.g. "http://192.168.1.10:3000" — NOT localhost (device can't reach your PC)
const { API_BASE_URL } = (Constants.expoConfig?.extra ?? {}) as {
  API_BASE_URL?: string;
};

// `API_BASE_URL` is configurable in `app.json` (Expo "extra" field).
// This avoids hardcoding `localhost`, which does not work on physical devices.
const BASE_URL = API_BASE_URL ?? "http://192.168.17.17:3000/api";
const SERVER_IP = "192.168.17.17:3000";

/**
 * Normalizes image URLs to ensure they are accessible on physical devices.
 */
export const formatImageUrl = (url: string): string => {
  if (!url) return "";
  
  // If it's a Cloudinary URL, it's already perfect. Return as is.
  if (url.includes("res.cloudinary.com")) {
    return url;
  }

  // Handle localtunnel and local IP mapping
  const localPatterns = [/localhost:3000/, /127\.0\.0\.1:3000/, /.*\.loca\.lt/];
  let formattedUrl = url;

  for (const pattern of localPatterns) {
    if (pattern.test(formattedUrl)) {
      // Replace the local/tunnel host with our known SERVER_IP.
      formattedUrl = formattedUrl.replace(pattern, SERVER_IP);
      // Ensure we use http (as we're targeting a local IP)
      formattedUrl = formattedUrl.replace(/^https:/, "http:");
      return formattedUrl;
    }
  }

  // Handle relative paths (e.g. "uploads/scan.jpg")
  if (!url.startsWith("http")) {
    if (url.startsWith("/")) {
      return `http://${SERVER_IP}${url}`;
    }
    return `http://${SERVER_IP}/uploads/${url}`;
  }

  return url;
};

const buildAuthHeaders = async () => {
  const token = await getAuthToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
};

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
  chatMessages: {
    role: "user" | "model";
    content: string;
    timestamp: string;
  }[];
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
      ...(await buildAuthHeaders()),
    } as HeadersInit,
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

  const response = await fetch(`${BASE_URL}/records?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      ...(await buildAuthHeaders()),
    } as HeadersInit,
  });
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
  const response = await fetch(`${BASE_URL}/records/${id}`, {
    headers: {
      Accept: "application/json",
      ...(await buildAuthHeaders()),
    } as HeadersInit,
  });
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
    headers: {
      Accept: "application/json",
      ...(await buildAuthHeaders()),
    } as HeadersInit,
  });
  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Failed to delete record.");
  }
};

/**
 * Send a follow-up chat message to Dr. Planteinstein.
 */
export const sendChatMessage = async (
  id: string,
  message: string
): Promise<{ userMessage: any; aiResponse: any }> => {
  const response = await fetch(`${BASE_URL}/records/${id}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(await buildAuthHeaders()),
    } as HeadersInit,
    body: JSON.stringify({ message }),
  });
  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Failed to send message.");
  }

  return {
    userMessage: json.userMessage,
    aiResponse: json.aiResponse,
  };
};

/**
 * Send a follow-up voice message (audio file) to Dr. Planteinstein.
 */
export const sendVoiceChat = async (
  id: string,
  audioUri: string
): Promise<{ userMessage: any; aiResponse: any }> => {
  const formData = new FormData();
  
  const filename = audioUri.split("/").pop() ?? "voice.m4a";
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `audio/${match[1]}` : "audio/m4a";

  formData.append("audio", {
    uri: audioUri,
    name: filename,
    type,
  } as any);

  const response = await fetch(`${BASE_URL}/records/${id}/voice-chat`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(await buildAuthHeaders()),
    } as HeadersInit,
    body: formData,
  });
  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Failed to send voice message.");
  }

  return {
    userMessage: json.userMessage,
    aiResponse: json.aiResponse,
  };
};

/**
 * Fetch the current user's profile.
 */
export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  username: string;
  phoneNumber: string;
  isVerified: boolean;
  emailVerified: boolean;
};

export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await fetch(`${BASE_URL}/auth/profile`, {
    headers: {
      Accept: "application/json",
      ...(await buildAuthHeaders()),
    } as HeadersInit,
  });
  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Failed to fetch user profile.");
  }

  return json.user as UserProfile;
};

export type CommunityPost = {
  _id: string;
  userId: {
    _id: string;
    displayName: string;
    username: string;
  };
  content: string;
  images: string[];
  category: "Cereals" | "Vegetables" | "Fruits" | "Other";
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  likes: string[];
  comments: any[];
  createdAt: string;
};

/**
 * Fetch the community social feed, optionally filtered by category.
 */
export const getCommunityPosts = async (category?: string): Promise<CommunityPost[]> => {
  const params = new URLSearchParams();
  if (category && category !== "All") params.append("category", category);

  const response = await fetch(`${BASE_URL}/community/posts?${params.toString()}`, {
    headers: {
      Accept: "application/json",
      ...(await buildAuthHeaders()),
    } as HeadersInit,
  });
  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Failed to fetch community posts.");
  }

  return json.data as CommunityPost[];
};

/**
 * Create a new community social post.
 */
export const createCommunityPost = async (
  content: string,
  category: string,
  imageUris: string[],
  location?: { latitude: number; longitude: number; address?: string }
): Promise<CommunityPost> => {
  const formData = new FormData();
  formData.append("content", content);
  formData.append("category", category);

  if (location) {
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
    if (location.address) formData.append("address", location.address);
  }

  // Append multiple images
  imageUris.forEach((uri, index) => {
    const filename = uri.split("/").pop() ?? `image_${index}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("images", {
      uri,
      name: filename,
      type,
    } as any);
  });

  const response = await fetch(`${BASE_URL}/community/posts`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      ...(await buildAuthHeaders()),
    } as HeadersInit,
  });

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message || "Failed to create community post.");
  }

  return json.data as CommunityPost;
};
