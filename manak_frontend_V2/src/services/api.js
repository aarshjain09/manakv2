import axios from "axios";

const API = axios.create({
  baseURL: "https://manakv2backend-tau.vercel.app/api",
});


// ✅ Attach token WITHOUT touching Content-Type
API.interceptors.request.use(req => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
