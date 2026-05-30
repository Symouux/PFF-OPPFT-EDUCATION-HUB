import axios from "./axios";

export const getDashboardStats = async () => {
  const res = await axios.get("/mentor/dashboard/statistics");
  return res.data;
};

export const getNotifications = async () => {
  const res = await axios.get("/mentor/requests");
  return res.data;
};

export const getAcceptedProjects = async () => {
  const res = await axios.get("/mentor/accepted-projects");
  return res.data;
};

export const getReviews = async () => {
  const res = await axios.get("/mentor/reviews");
  return res.data;
};
export const getDashboardChart = async () => {
  const res = await axios.get("/mentor/dashboard/chart");
  return res.data;
};

export const getDashboardActivity = async () => {
  const res = await axios.get("/mentor/requests");
  return res.data; // retourne { notifications: [...], unread_count: N }
};
