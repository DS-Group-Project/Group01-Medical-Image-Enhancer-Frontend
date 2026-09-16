import api from './api';

/**
 * Service for handling image uploads and job management API calls.
 */
export const uploadService = {
  /**
   * Uploads multiple images for enhancement.
   * 
   * @param {File[]} files - An array of File objects to upload.
   * @param {Function} [onProgress] - Optional callback function to track upload progress (0-100).
   * @returns {Promise<{jobs: Object[]}>} The created job objects.
   */
  uploadImages: async (files, onProgress) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  /**
   * Retrieves the status of a specific enhancement job.
   * 
   * @param {string} jobId - The unique identifier of the job.
   * @returns {Promise<{id: string, status: string, originalUrl: string, enhancedUrl: string, filename: string, createdAt: string, completedAt: string}>} The job details.
   */
  getJobStatus: async (jobId) => {
    const response = await api.get(`/jobs/${jobId}`);
    return response.data;
  },

  /**
   * Retrieves a paginated list of enhancement jobs.
   * 
   * @param {Object} params - Query parameters.
   * @param {number} [params.page=1] - The page number.
   * @param {number} [params.limit=10] - The number of items per page.
   * @param {string} [params.status] - Filter by job status (e.g., 'completed', 'pending').
   * @param {string} [params.search] - Search query for filenames.
   * @returns {Promise<{jobs: Object[], total: number, page: number, totalPages: number}>} Paginated jobs response.
   */
  getJobs: async (params = {}) => {
    const response = await api.get('/jobs', { params });
    return response.data;
  },

  /**
   * Downloads an image related to a job.
   * 
   * @param {string} jobId - The unique identifier of the job.
   * @param {'original'|'enhanced'|'both'} type - The type of image(s) to download.
   * @returns {Promise<void>} Triggers file download in the browser.
   */
  downloadImage: async (jobId, type) => {
    const response = await api.get(`/jobs/${jobId}/download/${type}`, {
      responseType: 'blob',
    });
    
    // Create a temporary link to trigger the download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    
    // Set appropriate filename based on response headers or generate one
    const contentDisposition = response.headers['content-disposition'];
    let filename = `download-${jobId}.zip`;
    if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
      const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      const matches = filenameRegex.exec(contentDisposition);
      if (matches != null && matches[1]) { 
        filename = matches[1].replace(/['"]/g, '');
      }
    } else {
        if (type === 'original' || type === 'enhanced') filename = `${type}-${jobId}.jpg`;
    }
    
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },

  /**
   * Deletes a specific enhancement job and its associated files.
   * 
   * @param {string} jobId - The unique identifier of the job.
   * @returns {Promise<{message: string}>} Success message.
   */
  deleteJob: async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
  }
};
