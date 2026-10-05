import { 
  User, 
  CertificateItem, 
  SKPIRequest, 
  StudentStats, 
  AppNotification 
} from '../types.ts';

const TOKEN_KEY = 'polteksi_auth_token';
const USER_KEY = 'polteksi_auth_user';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Do not set Content-Type if body is FormData
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    authStorage.clear();
    window.dispatchEvent(new Event('auth:unauthorized'));
  }

  if (!response.ok) {
    let errorMsg = 'Terjadi kesalahan pada server';
    try {
      const data = await response.json();
      errorMsg = data.error || errorMsg;
    } catch {
      errorMsg = response.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const data = await fetchWithAuth('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    authStorage.setToken(data.token);
    authStorage.setUser(data.user);
    return data;
  },

  async register(data: any): Promise<{ token: string; user: User }> {
    const res = await fetchWithAuth('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    authStorage.setToken(res.token);
    authStorage.setUser(res.user);
    return res;
  },

  async getCurrentUser(): Promise<{ user: User }> {
    const data = await fetchWithAuth('/api/auth/me');
    authStorage.setUser(data.user);
    return data;
  },

  async updateProfile(updates: Partial<User>): Promise<{ user: User }> {
    const data = await fetchWithAuth('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    authStorage.setUser(data.user);
    return data;
  },

  // Rules & Guidelines
  async getRules(): Promise<any> {
    return fetchWithAuth('/api/rules');
  },

  // Stats
  async getStudentStats(studentId?: string): Promise<StudentStats> {
    const url = studentId ? `/api/stats/student?studentId=${studentId}` : '/api/stats/student';
    return fetchWithAuth(url);
  },

  async getAdminStats(): Promise<any> {
    return fetchWithAuth('/api/stats/admin');
  },

  // Certificates
  async getCertificates(params?: { status?: string; categoryId?: string; search?: string; studentId?: string }): Promise<CertificateItem[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.categoryId) searchParams.set('categoryId', params.categoryId);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.studentId) searchParams.set('studentId', params.studentId);
    
    const qs = searchParams.toString();
    return fetchWithAuth(`/api/certificates${qs ? `?${qs}` : ''}`);
  },

  async getCertificateById(id: string): Promise<CertificateItem> {
    return fetchWithAuth(`/api/certificates/${id}`);
  },

  async createCertificate(formData: FormData): Promise<CertificateItem> {
    return fetchWithAuth('/api/certificates', {
      method: 'POST',
      body: formData
    });
  },

  async updateCertificate(id: string, formData: FormData): Promise<CertificateItem> {
    return fetchWithAuth(`/api/certificates/${id}`, {
      method: 'PUT',
      body: formData
    });
  },

  async verifyCertificate(id: string, payload: {
    status: 'Disetujui' | 'Perlu Revisi' | 'Ditolak';
    approvedPoints: number;
    adminNotes?: string;
    isMandatoryMatch?: string | null;
  }): Promise<CertificateItem> {
    return fetchWithAuth(`/api/certificates/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  getCertificateFileUrl(id: string): string {
    return `/api/certificates/${id}/file`;
  },

  // Admin Student Management
  async getAdminStudents(): Promise<any[]> {
    return fetchWithAuth('/api/admin/students');
  },

  async getAdminStudentDetail(id: string): Promise<any> {
    return fetchWithAuth(`/api/admin/students/${id}`);
  },

  async updateStudentAcademic(id: string, payload: {
    nomorIjazah?: string;
    tanggalLulus?: string;
    gelar?: string;
    statusKelulusan?: string;
  }): Promise<User> {
    return fetchWithAuth(`/api/admin/students/${id}/academic`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  // SKPI Workflow
  async getSKPI(params?: { status?: string; search?: string }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.search) searchParams.set('search', params.search);
    const qs = searchParams.toString();
    return fetchWithAuth(`/api/skpi${qs ? `?${qs}` : ''}`);
  },

  async getSKPIPreview(studentId?: string): Promise<any> {
    const url = studentId ? `/api/skpi/preview?studentId=${studentId}` : '/api/skpi/preview';
    return fetchWithAuth(url);
  },

  async applySKPI(): Promise<SKPIRequest> {
    return fetchWithAuth('/api/skpi/apply', {
      method: 'POST'
    });
  },

  async reviewSKPI(id: string, payload: {
    status: 'Dalam Pemeriksaan' | 'Perlu Revisi' | 'Ditolak';
    adminNotes: string;
  }): Promise<SKPIRequest> {
    return fetchWithAuth(`/api/skpi/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async publishSKPI(id: string): Promise<SKPIRequest> {
    return fetchWithAuth(`/api/skpi/${id}/publish`, {
      method: 'POST'
    });
  },

  async downloadSKPI(id: string): Promise<SKPIRequest> {
    return fetchWithAuth(`/api/skpi/${id}/download`);
  },

  // Notifications
  async getNotifications(): Promise<AppNotification[]> {
    return fetchWithAuth('/api/notifications');
  },

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return fetchWithAuth(`/api/notifications/${id}/read`, {
      method: 'POST'
    });
  },

  async markAllNotificationsRead(): Promise<{ success: boolean }> {
    return fetchWithAuth('/api/notifications/read-all', {
      method: 'POST'
    });
  }
};
