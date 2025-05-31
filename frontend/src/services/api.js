const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8000/api');

class ApiService {
  constructor() {
    this.token = sessionStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      sessionStorage.setItem('token', token);
    } else {
      sessionStorage.removeItem('token');
    }
  }

  getAuthHeaders() {
    return this.token ? {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: '请求失败' }));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API请求错误:', error);
      throw error;
    }
  }

  // 认证相关
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    
    if (response.accessToken) {
      this.setToken(response.accessToken);
    }
    
    return response;
  }

  async getCurrentUser() {
    return await this.request('/auth/me');
  }

  async updateProfile(profileData) {
    return await this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async changePassword(passwordData) {
    return await this.request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  logout() {
    this.setToken(null);
  }

  // 用户管理（管理员）
  async getUsers() {
    return await this.request('/users');
  }

  async createUser(userData) {
    return await this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async updateUser(userId, userData) {
    return await this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async resetUserPassword(userId, newPassword) {
    return await this.request(`/users/${userId}/reset-password`, {
      method: 'PUT',
      body: JSON.stringify({ new_password: newPassword })
    });
  }

  async deleteUser(userId) {
    return await this.request(`/users/${userId}`, {
      method: 'DELETE'
    });
  }

  // 班级管理
  async getClasses() {
    return await this.request('/classes');
  }

  async createClass(classData) {
    return await this.request('/classes', {
      method: 'POST',
      body: JSON.stringify(classData)
    });
  }

  async updateClass(classId, classData) {
    return await this.request(`/classes/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(classData)
    });
  }

  async deleteClass(classId) {
    return await this.request(`/classes/${classId}`, {
      method: 'DELETE'
    });
  }

  // 分组管理
  async getGroups(classId) {
    return await this.request(`/classes/${classId}/groups`);
  }

  async createGroup(groupData) {
    return await this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(groupData)
    });
  }

  async updateGroup(groupId, groupData) {
    return await this.request(`/groups/${groupId}`, {
      method: 'PUT',
      body: JSON.stringify(groupData)
    });
  }

  async deleteGroup(groupId) {
    return await this.request(`/groups/${groupId}`, {
      method: 'DELETE'
    });
  }

  // 学生管理
  async getStudents(groupId) {
    return await this.request(`/groups/${groupId}/students`);
  }

  async createStudent(studentData) {
    return await this.request('/students', {
      method: 'POST',
      body: JSON.stringify(studentData)
    });
  }

  async updateStudent(studentId, studentData) {
    return await this.request(`/students/${studentId}`, {
      method: 'PUT',
      body: JSON.stringify(studentData)
    });
  }

  async deleteStudent(studentId) {
    return await this.request(`/students/${studentId}`, {
      method: 'DELETE'
    });
  }

  // 点名记录
  async createRollCallRecord(recordData) {
    return await this.request('/roll-call', {
      method: 'POST',
      body: JSON.stringify(recordData)
    });
  }

  async getRollCallHistory() {
    return await this.request('/roll-call/history');
  }
}

export default new ApiService();