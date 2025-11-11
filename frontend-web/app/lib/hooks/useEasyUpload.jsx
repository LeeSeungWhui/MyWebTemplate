import { useSharedStore } from '@/app/common/store/SharedStore';
import { getBackendHost } from '@/app/common/config/getBackendHost.client';
import { parseJsonPayload, normalizeNestedJsonFields } from '@/app/lib/runtime/jsonPayload';

const DEFAULT_OPTIONS = {
  fileUploadUrl: '',
  singleFieldName: 'file',
  multiFieldName: 'files',
  credentials: 'include',
  extraFormData: null,
  headers: {},
  csrf: 'auto', // 'auto' | 'skip'
};

const normalizeErrorMessage = async (response) => {
  const text = await response.text().catch(() => '');
  if (!text) return `${response.status} 업로드 실패`;
  try {
    const json = JSON.parse(text);
    return json?.message || json?.result || text;
  } catch (_) {
    return text;
  }
};


const resolveUploadUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  // Absolute URLs are used as-is (e.g., S3 presigned)
  if (/^https?:\/\//i.test(url)) return url;
  // Already BFF-prefixed
  if (url.startsWith('/api/bff/')) return url;
  // Prefer BFF for same-origin relative uploads to preserve cookie semantics
  const normalized = url.startsWith('/') ? url : `/${url}`;
  return `/api/bff${normalized}`;
};

async function getClientCsrf() {
  try {
    const res = await fetch('/api/bff/api/v1/auth/csrf', { credentials: 'include', cache: 'no-store' });
    const j = await res.json().catch(() => ({}));
    return j?.result?.csrf || null;
  } catch (_) {
    return null;
  }
}

const toArray = (filesInput) => {
  if (!filesInput) return [];
  if (filesInput instanceof File || filesInput instanceof Blob) return [filesInput];
  const result = [];
  if (typeof filesInput.forEach === 'function') {
    filesInput.forEach((item) => {
      if (item) result.push(item);
    });
    return result;
  }
  if (typeof filesInput.length === 'number') {
    for (let idx = 0; idx < filesInput.length; idx += 1) {
      const value = filesInput[idx];
      if (value) result.push(value);
    }
    return result;
  }
  return [];
};


export default async function useEasyUpload(filesInput, options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  if (!config.fileUploadUrl) {
    throw new Error('fileUploadUrl is required.');
  }
  const extraPayloadCandidates = [];
  if (config.extraFormData && typeof config.extraFormData === 'object') {
    extraPayloadCandidates.push(config.extraFormData);
  }
  if (config.etc && typeof config.etc === 'object') {
    extraPayloadCandidates.push(config.etc);
  }

  const files = toArray(filesInput);
  if (!files.length) return null;

  const store = useSharedStore.getState();
  const updateLoading = typeof store?.updateLoading === 'function' ? store.updateLoading : () => { };
  const showAlert = typeof store?.showAlert === 'function' ? store.showAlert : () => { };

  const formData = new FormData();
  const fieldName = files.length === 1 ? config.singleFieldName : config.multiFieldName;
  files.forEach((file) => {
    if (file) formData.append(fieldName, file);
  });

  extraPayloadCandidates.forEach((payload) => {
    Object.entries(payload).forEach(([key, value]) => {
      if (value == null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item != null) formData.append(key, item);
        });
        return;
      }
      formData.append(key, value);
    });
  });

  if (options.loading) {
    updateLoading(1);
  }
  try {
    const targetUrl = resolveUploadUrl(config.fileUploadUrl);
    const headers = { ...(config.headers || {}) };
    // CSRF: add only for same-origin BFF calls
    if (config.csrf !== 'skip' && targetUrl.startsWith('/api/bff/')) {
      const csrf = await getClientCsrf();
      if (csrf) headers['X-CSRF-Token'] = csrf;
    }
    const response = await fetch(targetUrl, {
      method: 'POST',
      body: formData,
      credentials: config.credentials,
      headers,
    });

    if (!response.ok) {
      const message = await normalizeErrorMessage(response);
      showAlert(message || '파일 업로드에 실패했습니다.', { title: '업로드 실패', type: 'error' });
      throw new Error(message || '업로드 실패');
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    const rawText = await response.text().catch(() => '');

    if (!contentType.includes('application/json')) {
      return rawText || null;
    }

    const parsed = parseJsonPayload(rawText, { context: 'EasyUpload' });
    return normalizeNestedJsonFields(parsed);
  } catch (error) {
    if (!error?.message) {
      showAlert('파일 업로드 중 알 수 없는 오류가 발생했습니다.', { title: '업로드 실패', type: 'error' });
    }
    throw error;
  } finally {
    updateLoading(-1);
  }
}
