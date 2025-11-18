
import * as SecureStore from "expo-secure-store";

// Secure Storage helpers
export const SecureStorage = {
  async getItem(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  },
  async removeItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  },
    async multiRemove(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key)=>SecureStore.deleteItemAsync(key)));
    } catch (error) {
      console.error(`Error removing keys:`, error);
    }
  },
};