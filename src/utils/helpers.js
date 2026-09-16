import { JOB_STATUS, MAX_FILE_SIZE, ACCEPTED_FILE_TYPES } from './constants';
import { Clock, CheckCircle2, XCircle, Loader2, UploadCloud, FileImage } from 'lucide-react';

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(dateString);
}

export function getStatusColor(status) {
  switch (status) {
    case JOB_STATUS.PENDING:
    case JOB_STATUS.QUEUED:
      return 'text-slate-500';
    case JOB_STATUS.UPLOADING:
    case JOB_STATUS.PROCESSING:
      return 'text-primary-600';
    case JOB_STATUS.COMPLETED:
      return 'text-success';
    case JOB_STATUS.FAILED:
      return 'text-error';
    default:
      return 'text-slate-500';
  }
}

export function getStatusIcon(status) {
  switch (status) {
    case JOB_STATUS.PENDING:
    case JOB_STATUS.QUEUED:
      return Clock;
    case JOB_STATUS.UPLOADING:
      return UploadCloud;
    case JOB_STATUS.PROCESSING:
      return Loader2;
    case JOB_STATUS.COMPLETED:
      return CheckCircle2;
    case JOB_STATUS.FAILED:
      return XCircle;
    default:
      return FileImage;
  }
}

export function truncateFilename(name, maxLength = 20) {
  if (!name) return '';
  if (name.length <= maxLength) return name;
  const extIndex = name.lastIndexOf('.');
  if (extIndex !== -1 && name.length - extIndex <= 5) {
    const ext = name.slice(extIndex);
    const baseName = name.slice(0, extIndex);
    return `${baseName.slice(0, maxLength - ext.length - 3)}...${ext}`;
  }
  return `${name.slice(0, maxLength - 3)}...`;
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function validateImageFile(file) {
  const errors = [];
  
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File is too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
  }
  
  const acceptedTypes = Object.keys(ACCEPTED_FILE_TYPES);
  if (!acceptedTypes.includes(file.type)) {
    const isDicom = file.name.toLowerCase().endsWith('.dcm') || file.name.toLowerCase().endsWith('.dicom');
    if (!(isDicom && ACCEPTED_FILE_TYPES['application/dicom'].some(ext => file.name.toLowerCase().endsWith(ext)))) {
       errors.push('File type not supported. Please upload JPEG, PNG, or DICOM files.');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}
