/**
 * Mock Data and Services for local development and testing without a backend.
 */

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockUser = {
  id: 'usr_001',
  name: 'Dr. Jane Smith',
  email: 'jane.smith@medical.example.com',
  avatar: 'https://i.pravatar.cc/150?u=jane',
  role: 'radiologist'
};

const getDaysAgo = (days) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const mockJobs = [
  { id: 'job_001', status: 'completed', filename: 'chest_xray_001.jpg', createdAt: getDaysAgo(0), completedAt: getDaysAgo(0), originalUrl: 'https://picsum.photos/seed/med1/400/400', enhancedUrl: 'https://picsum.photos/seed/med1-e/400/400' },
  { id: 'job_002', status: 'processing', filename: 'brain_mri_ax.png', createdAt: getDaysAgo(0), progress: 45, originalUrl: 'https://picsum.photos/seed/med2/400/400' },
  { id: 'job_003', status: 'completed', filename: 'knee_xr_lat.jpg', createdAt: getDaysAgo(1), completedAt: getDaysAgo(1), originalUrl: 'https://picsum.photos/seed/med3/400/400', enhancedUrl: 'https://picsum.photos/seed/med3-e/400/400' },
  { id: 'job_004', status: 'pending', filename: 'spine_ct_03.dcm', createdAt: getDaysAgo(1), originalUrl: 'https://picsum.photos/seed/med4/400/400' },
  { id: 'job_005', status: 'failed', filename: 'corrupted_file.jpg', createdAt: getDaysAgo(2), error: 'Invalid image format or corrupted data', originalUrl: 'https://picsum.photos/seed/med5/400/400' },
  { id: 'job_006', status: 'completed', filename: 'dental_panoramic.png', createdAt: getDaysAgo(2), completedAt: getDaysAgo(2), originalUrl: 'https://picsum.photos/seed/med6/400/400', enhancedUrl: 'https://picsum.photos/seed/med6-e/400/400' },
  { id: 'job_007', status: 'completed', filename: 'hand_xray_AP.jpg', createdAt: getDaysAgo(3), completedAt: getDaysAgo(3), originalUrl: 'https://picsum.photos/seed/med7/400/400', enhancedUrl: 'https://picsum.photos/seed/med7-e/400/400' },
  { id: 'job_008', status: 'completed', filename: 'chest_CT_coronal.png', createdAt: getDaysAgo(3), completedAt: getDaysAgo(3), originalUrl: 'https://picsum.photos/seed/med8/400/400', enhancedUrl: 'https://picsum.photos/seed/med8-e/400/400' },
  { id: 'job_009', status: 'processing', filename: 'pelvis_mri_t2.dcm', createdAt: getDaysAgo(4), progress: 85, originalUrl: 'https://picsum.photos/seed/med9/400/400' },
  { id: 'job_010', status: 'completed', filename: 'skull_xray_lat.jpg', createdAt: getDaysAgo(5), completedAt: getDaysAgo(5), originalUrl: 'https://picsum.photos/seed/med10/400/400', enhancedUrl: 'https://picsum.photos/seed/med10-e/400/400' },
  { id: 'job_011', status: 'completed', filename: 'shoulder_mri.png', createdAt: getDaysAgo(6), completedAt: getDaysAgo(6), originalUrl: 'https://picsum.photos/seed/med11/400/400', enhancedUrl: 'https://picsum.photos/seed/med11-e/400/400' },
  { id: 'job_012', status: 'completed', filename: 'abd_ultrasound.jpg', createdAt: getDaysAgo(7), completedAt: getDaysAgo(7), originalUrl: 'https://picsum.photos/seed/med12/400/400', enhancedUrl: 'https://picsum.photos/seed/med12-e/400/400' },
];

export const mockStats = {
  totalUploads: 147,
  processing: 3,
  completed: 138,
  failed: 6
};

export const mockAuthService = {
  login: async (email, password) => {
    await delay(600);
    if (email === 'admin@admin.com' || password === 'password') { // lenient mock login
      localStorage.setItem('token', 'mock_token_12345');
      return { user: mockUser, token: 'mock_token_12345' };
    }
    return { user: mockUser, token: 'mock_token_12345' };
  },
  register: async (userData) => {
    await delay(800);
    localStorage.setItem('token', 'mock_token_12345');
    return { user: { ...mockUser, name: userData.name, email: userData.email }, token: 'mock_token_12345' };
  },
  logout: async () => {
    await delay(300);
    localStorage.removeItem('token');
  },
  getCurrentUser: async () => {
    await delay(400);
    if (!localStorage.getItem('token')) throw new Error('Unauthorized');
    return { user: mockUser };
  },
  getToken: () => localStorage.getItem('token'),
  isAuthenticated: () => !!localStorage.getItem('token')
};

export const mockUploadService = {
  uploadImages: async (files, onProgress) => {
    // Simulate upload progress
    if (onProgress) {
      for (let i = 10; i <= 100; i += 10) {
        await delay(100);
        onProgress(i);
      }
    } else {
      await delay(1000);
    }
    const newJobs = files.map((file, idx) => ({
      id: `job_new_${Date.now()}_${idx}`,
      status: 'pending',
      filename: file.name,
      createdAt: new Date().toISOString(),
      originalUrl: URL.createObjectURL(file)
    }));
    return { jobs: newJobs };
  },
  getJobStatus: async (jobId) => {
    await delay(300);
    const job = mockJobs.find(j => j.id === jobId) || { id: jobId, status: 'completed', filename: 'mock.jpg' };
    return job;
  },
  getJobs: async (params = {}) => {
    await delay(500);
    const { page = 1, limit = 10, status, search } = params;
    let filteredJobs = [...mockJobs];
    
    if (status) {
      filteredJobs = filteredJobs.filter(job => job.status === status);
    }
    if (search) {
      filteredJobs = filteredJobs.filter(job => job.filename.toLowerCase().includes(search.toLowerCase()));
    }
    
    const startIndex = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(startIndex, startIndex + limit);
    
    return {
      jobs: paginatedJobs,
      total: filteredJobs.length,
      page,
      totalPages: Math.ceil(filteredJobs.length / limit)
    };
  },
  downloadImage: async (jobId, type) => {
    await delay(600);
    console.log(`Mock downloading ${type} image for job ${jobId}`);
    // Simulate file download by creating an empty blob
    const url = window.URL.createObjectURL(new Blob(['mock data']));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${type}-${jobId}.mock`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
  deleteJob: async (jobId) => {
    await delay(400);
    return { message: 'Job deleted successfully' };
  }
};
