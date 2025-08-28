// src/AgriConnectRCA.js
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ANDROID_LOCALHOST = 'http://10.0.2.2:3000';
const IOS_WEB_LOCALHOST = 'http://localhost:3000';

const DEFAULT_BASE_URL = Platform.OS === 'android' ? ANDROID_LOCALHOST : IOS_WEB_LOCALHOST;
const TOKEN_KEY = 'agriconnect_token';
const USER_KEY  = 'agriconnect_user';

let BASE_URL = DEFAULT_BASE_URL;
let inMemoryToken = null;

const getBaseUrl = async () => {
  try {
    const saved = await AsyncStorage.getItem('agriconnect_base_url');
    return saved || BASE_URL;
  } catch {
    return BASE_URL;
  }
};

const setToken = async (token) => {
  inMemoryToken = token || null;
  if (!token) {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

const getToken = async () => {
  if (inMemoryToken) return inMemoryToken;
  const t = await AsyncStorage.getItem(TOKEN_KEY);
  inMemoryToken = t;
  return t;
};

const setUser = async (user) => {
  if (!user) {
    await AsyncStorage.removeItem(USER_KEY);
    return;
  }
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = async () => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
};

const authHeaders = async () => {
  const t = await getToken();
  return t
    ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' };
};

const handle = async (res) => {
  const txt = await res.text();
  let data = null;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = { raw: txt }; }
  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    const err = new Error(msg); err.status = res.status; err.data = data;
    throw err;
  }
  return data;
};

// ---------------- AUTH ----------------
const register = async ({ name, phone, password, location, type }) => {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, phone, password, location, user_type: type || 'buyer' }),
  });
  const data = await handle(res);
  if (data?.token) await setToken(data.token);
  if (data?.user)  await setUser(data.user);
  return data;
};

const login = async ({ phone, password }) => {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, password }),
  });
  const data = await handle(res);
  if (data?.token) await setToken(data.token);
  if (data?.user)  await setUser(data.user);
  return data;
};

const logout = async () => {
  await setToken(null);
  await setUser(null);
  return true;
};

// Forgot / Reset
const forgotPassword = async (phone) => {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/auth/forgot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return handle(res);
};

const verifyOtp = async (phone, code) => {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code }),
  });
  return handle(res);
};

const resetPassword = async (phone, code, new_password) => {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/auth/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, code, new_password }),
  });
  return handle(res);
};

const resendOtp = async (phone) => forgotPassword(phone);

// ---------------- PRODUITS ----------------
const getProducts = async (params = {}) => {
  const base = await getBaseUrl();
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${base}/api/products${qs ? `?${qs}` : ''}`, { headers: await authHeaders() });
  return handle(res);
};

const addProduct = async (payload) => {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/products`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(res);
};

const updateProduct = async (id, payload) => {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/products/${id}`, {
    method: 'PUT',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(res);
};

const deleteProduct = async (id) => {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/products/${id}`, {
    method: 'DELETE',
    headers: await authHeaders(),
  });
  return handle(res);
};

// ---------------- COMMANDES (simple) ----------------
const getOrders = async () => {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/orders`, { headers: await authHeaders() });
  return handle(res);
};

const createOrder = async (payload) => {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/orders`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return handle(res);
};

// ---------------- UPLOAD ----------------
const uploadImage = async (filePart) => {
  const base = await getBaseUrl();
  const headers = {};
  const token = await getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const form = new FormData();
  form.append('file', filePart);

  const res = await fetch(`${base}/api/upload`, { method: 'POST', headers, body: form });
  return handle(res);
};

const API = {
  getBaseUrl,
  setToken,
  getToken,
  getUser,
  logout,

  // auth
  register, login,

  // forgot/reset
  forgotPassword, verifyOtp, resetPassword, resendOtp,

  // produits
  getProducts, addProduct, updateProduct, deleteProduct,

  // commandes
  getOrders, createOrder,

  // upload
  uploadImage,
};

export default API;
