import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Stages ──────────────────────────────────────────────────────────────────

export const fetchStages = () => api.get('/stages').then(r => r.data)

export const createStage = (data) => api.post('/stages', data).then(r => r.data)

export const updateStage = (id, data) => api.patch(`/stages/${id}`, data).then(r => r.data)

export const deleteStage = (id) => api.delete(`/stages/${id}`)

// ─── Automations ─────────────────────────────────────────────────────────────

export const createAutomation = (stageId, data) =>
  api.post(`/stages/${stageId}/automations`, data).then(r => r.data)

export const updateAutomation = (stageId, autoId, data) =>
  api.patch(`/stages/${stageId}/automations/${autoId}`, data).then(r => r.data)

export const deleteAutomation = (stageId, autoId) =>
  api.delete(`/stages/${stageId}/automations/${autoId}`)

// ─── Customers ───────────────────────────────────────────────────────────────

export const fetchCustomers = (params = {}) =>
  api.get('/customers', { params }).then(r => r.data)

export const createCustomer = (data) => api.post('/customers', data).then(r => r.data)

export const updateCustomer = (id, data) =>
  api.patch(`/customers/${id}`, data).then(r => r.data)

export const deleteCustomer = (id) => api.delete(`/customers/${id}`)

// ─── Metrics ─────────────────────────────────────────────────────────────────

export const fetchMetrics = () => api.get('/metrics').then(r => r.data)
