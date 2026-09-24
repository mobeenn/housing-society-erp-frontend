import apiClient from "@/lib/apiClient";

const unwrap = (response) => response.data.data;

export const getRecoveryConfig = async () => unwrap(await apiClient.get("/recovery/config"));
export const getRecoveryPool = async (params = {}) => unwrap(await apiClient.get("/recovery/pool", { params }));
export const assignRecovery = async (data) => unwrap(await apiClient.post("/recovery/assign", data));
export const reserveRecovery = async (bookingId) => unwrap(await apiClient.post(`/recovery/${bookingId}/reserve`));
export const reassignRecovery = async (assignmentId, agentId) => unwrap(await apiClient.post(`/recovery/${assignmentId}/reassign`, { agentId }));
export const resolveRecovery = async (assignmentId) => unwrap(await apiClient.post(`/recovery/${assignmentId}/resolve`));
export const getMyPlots = async (params = {}) => unwrap(await apiClient.get("/recovery/my-plots", { params }));
export const getRecoveryAssignments = async (params = {}) => unwrap(await apiClient.get("/recovery/assignments", { params }));
export const getRecoveryAgents = async () => unwrap(await apiClient.get("/recovery/agents"));
export const getRecoveryCalls = async (assignmentId) => unwrap(await apiClient.get(`/recovery/${assignmentId}/calls`));
export const addRecoveryCall = async (assignmentId, data) => unwrap(await apiClient.post(`/recovery/${assignmentId}/calls`, data));
export const getMyRecoveryPerformance = async () => unwrap(await apiClient.get("/recovery/my-performance"));
export const getTeamRecoveryPerformance = async () => unwrap(await apiClient.get("/recovery/team-performance"));
export const getOverdueRecovery = async (params = {}) => unwrap(await apiClient.get("/recovery/overdue", { params }));
export const sendRecoveryReminders = async (bookingIds) => unwrap(await apiClient.post("/recovery/reminders", { bookingIds }));
export const exportOverdueRecovery = async (params = {}) => (await apiClient.get("/recovery/overdue/export", { params, responseType: "blob" })).data;
export const runRecoveryAutoBlock = async () => unwrap(await apiClient.post("/recovery/auto-block/run"));
