const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Функція для отримання токену з localStorage
function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token')
  }
  return null
}

// Базовий fetch з авторизацією
async function fetchWithAuth(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken()
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  })
}

// Auth API
export const authApi = {
  async register(name: string, email: string, password: string) {
    const response = await fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
    const data = await response.json()
    if (response.ok && data.token) {
      localStorage.setItem('token', data.token)
    }
    return data
  },

  async login(email: string, password: string) {
    const response = await fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (response.ok && data.token) {
      localStorage.setItem('token', data.token)
    }
    return data
  },

  async getMe() {
    const response = await fetchWithAuth('/auth/me')
    return response.json()
  },

  async updateProfile(data: {
    name?: string
    email?: string
    currentPassword?: string
    newPassword?: string
  }) {
    const response = await fetchWithAuth('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.json()
  },

  logout() {
    localStorage.removeItem('token')
  },
}

// Time Off API
export const timeOffApi = {
  async getRequests() {
    const response = await fetchWithAuth('/time-off')
    return response.json()
  },

  async createRequest(data: {
    type: 'VACATION' | 'SICK_LEAVE'
    startDate: string
    endDate: string
    reason: string
  }) {
    const response = await fetchWithAuth('/time-off', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return response.json()
  },

  async updateRequestStatus(id: string, status: 'APPROVED' | 'REJECTED') {
    const response = await fetchWithAuth(`/time-off/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    return response.json()
  },
}

// Admin API
export const adminApi = {
  async getRequests() {
    const response = await fetchWithAuth('/admin/requests')
    return response.json()
  },

  async getStats() {
    const response = await fetchWithAuth('/admin/stats')
    return response.json()
  },

  async getUsers() {
    const response = await fetchWithAuth('/admin/users')
    return response.json()
  },
}

// News API
export const newsApi = {
  async getNews() {
    const response = await fetchWithAuth('/news')
    return response.json()
  },

  async createNews(title: string, content: string, imageUrl?: string) {
    const response = await fetchWithAuth('/news', {
      method: 'POST',
      body: JSON.stringify({ title, content, imageUrl }),
    })
    return response.json()
  },
}

// Holidays API
export const holidaysApi = {
  async getHolidays() {
    const response = await fetchWithAuth('/holidays')
    return response.json()
  },

  async createHoliday(name: string, date: string, type: string) {
    const response = await fetchWithAuth('/holidays', {
      method: 'POST',
      body: JSON.stringify({ name, date, type }),
    })
    return response.json()
  },
}

