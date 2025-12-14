const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.status = status
    this.data = data
  }
}

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token')
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }
  
  if (token && !options.skipAuth) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const config = { ...options, headers }
  if (options.body && typeof options.body !== 'string') {
    config.body = JSON.stringify(options.body)
  }
  
  try {
    const response = await fetch(`${apiBaseUrl}${endpoint}`, config)
    const newToken = response.headers.get('X-New-Token')
    if (newToken) localStorage.setItem('token', newToken)
    
    if (response.status === 204) return null
    
    const data = await response.json().catch(() => null)
    
    if (!response.ok) {
      // Better error message extraction
      let message = 'An error occurred'
      
      if (data?.detail) {
        if (Array.isArray(data.detail)) {
          // Validation errors
          message = data.detail.map(err => `${err.loc[1]}: ${err.msg}`).join(', ')
        } else if (typeof data.detail === 'string') {
          message = data.detail
        }
      }
      
      throw new ApiError(message, response.status, data)
    }
    
    return data
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError('Network error - Could not connect to server', 0, null)
  }
}

export const api = {
  signup: (email, password) => request('/auth/signup', { method: 'POST', body: { email, password }, skipAuth: true }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password }, skipAuth: true }),
  
  getProducts: () => request('/products/'),
  createProduct: (data) => request('/products/', { method: 'POST', body: data }),
  getProduct: (id) => request(`/products/${id}`),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  
  getCustomers: () => request('/customers/'),
  createCustomer: (data) => request('/customers/', { method: 'POST', body: data }),
  getCustomer: (id) => request(`/customers/${id}`),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: data }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  
  getSales: () => request('/sales/'),
  createSale: (data) => request('/sales/', { method: 'POST', body: data }),
  getSale: (id) => request(`/sales/${id}`),
  updateSale: (id, data) => request(`/sales/${id}`, { method: 'PUT', body: data }),
  deleteSale: (id) => request(`/sales/${id}`, { method: 'DELETE' }),
}

export { ApiError }
