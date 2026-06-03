import axios from "./axios";

export const getProjects = async () => {
  const res = await axios.get("/projects");
  return res.data;
};

export const getProjectDetail = async (id) => {
  const res = await axios.get(`/projects/${id}`);
  return res.data;
};

export const getCategories = async () => {
  const res = await axios.get("/categories");
  return res.data;
};

export const voteProject = async (id) => {
  const res = await axios.post(`/projects/${id}/vote`);
  return res.data;
};

export const getMentors = async () => {
  const res = await axios.get("/mentors");
  return res.data;
};

export const getMentorRequests = async () => {
  const res = await axios.get("/mentor_requests");
  return res.data;
};

export const createMentorRequest = async (projectId, mentorId) => {
  const res = await axios.post("/mentor_requests", {
    project_id: projectId,
    mentor_id: mentorId,
  });
  return res.data;
};

export const getResources = async () => {
  const res = await axios.get("/resources");
  return res.data;
};

export const createProject = async (data) => {
  const res = await axios.post("/projects", data);
  return res.data;
};

export const updateProject = async (id, data) => {
  const res = await axios.put(`/projects/${id}`, data);
  return res.data;
};

export const deleteProject = async (id) => {
  const res = await axios.delete(`/projects/${id}`);
  return res.data;
};

export const getConversations = async () => {
  const res = await axios.get("/conversations");
  return res.data;
};

export const createConversation = async (userTwoId) => {
  const res = await axios.post("/conversations", { user_two: userTwoId });
  return res.data;
};

export const getMessages = async (conversationId) => {
  const res = await axios.get(`/messages/${conversationId}`);
  return res.data;
};

export const sendMessage = async (conversationId, messageText) => {
  const res = await axios.post("/messages", {
    conversation_id: conversationId,
    message: messageText,
  });
  return res.data;
};

export const markMessagesAsRead = async (conversationId) => {
  const res = await axios.put(`/messages/read/${conversationId}`);
  return res.data;
};

export const fetchGithubPreview = async (url) => {
  const res = await axios.post("/previews/github", { url });
  return res.data;
};

export const fetchDrivePreview = async (url) => {
  const res = await axios.post("/previews/drive", { url });
  return res.data;
};

export const createResource = async (data) => {
  const res = await axios.post("/resources", data);
  return res.data;
};

