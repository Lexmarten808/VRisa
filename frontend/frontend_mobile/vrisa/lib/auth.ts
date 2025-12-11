// Use AsyncStorage when available; otherwise fall back to in-memory storage
let AsyncStorageImpl: any = null;
try {
  // dynamic require to avoid Metro bundler failing when package is not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@react-native-async-storage/async-storage');
  AsyncStorageImpl = mod && (mod.default || mod);
} catch (e) {
  AsyncStorageImpl = null;
}

const USER_KEY = 'vrisa_user_v1';
let memoryStore: Record<string,string> = {};

async function saveUser(user: any) {
  const raw = JSON.stringify(user);
  if (AsyncStorageImpl && AsyncStorageImpl.setItem) {
    try { await AsyncStorageImpl.setItem(USER_KEY, raw); return; } catch (e) { /* fallback to memory */ }
  }
  memoryStore[USER_KEY] = raw;
}

async function getUser() {
  if (AsyncStorageImpl && AsyncStorageImpl.getItem) {
    try {
      const raw = await AsyncStorageImpl.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  const raw = memoryStore[USER_KEY];
  return raw ? JSON.parse(raw) : null;
}

async function clearUser() {
  if (AsyncStorageImpl && AsyncStorageImpl.removeItem) {
    try { await AsyncStorageImpl.removeItem(USER_KEY); return; } catch (e) { /* fallback to memory */ }
  }
  delete memoryStore[USER_KEY];
}

export default { saveUser, getUser, clearUser };
