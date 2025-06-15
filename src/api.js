import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // adapte si tu utilises un serveur distant
});

export default API; 