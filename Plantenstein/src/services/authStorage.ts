import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "authToken";
const USER_KEY = "authUser";

export type StoredUser = {
  id: string;
  email: string;
  displayName: string;
  username: string;
};

export const saveAuthToken = async (token: string) => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getAuthToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(TOKEN_KEY);
};

export const clearAuth = async () => {
  await Promise.all([SecureStore.deleteItemAsync(TOKEN_KEY), SecureStore.deleteItemAsync(USER_KEY)]);
};

export const saveAuthUser = async (user: StoredUser) => {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export const getAuthUser = async (): Promise<StoredUser | null> => {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
};

