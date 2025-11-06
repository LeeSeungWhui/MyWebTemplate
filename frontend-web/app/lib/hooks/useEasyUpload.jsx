import { useSharedStore } from '@/app/common/store/SharedStore';
import { getBackendHost } from '@/app/common/config/getBackendHost.client';

const DEFAULT_OPTIONS = {
  fileUploadUrl: '',
  singleFieldName: 'file',
  multiFieldName: 'files',
  credentials: 'include',
  extraFormData: null,
  headers: {},
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

const sanitizeJsonString = (text) => {
  if (!text) return text;

  const stack = [];
  let sanitized = '';
  let inString = false;
  let escapeNext = false;
  let stringMode = 'value';

  const skipWhitespace = (start) => {
    for (let i = start; i < text.length; i += 1) {
      const ch = text[i];
      if (ch === ' ' || ch === '\t' || ch === '\r' || ch === '\n') continue;
      return { ch, index: i };
    }
    return { ch: '', index: text.length };
  };

  for (let idx = 0; idx < text.length; idx += 1) {
    const ch = text[idx];

    if (inString) {
      if (escapeNext) {
        escapeNext = false;
        sanitized += ch;
        continue;
      }
      if (ch === '\\') {
        escapeNext = true;
        sanitized += '\\';
        continue;
      }

      if (ch === '"') {
        const nextInfo = skipWhitespace(idx + 1);
        let shouldClose;
        if (stringMode === 'key') {
          shouldClose = nextInfo.ch === ':';
        } else {
          shouldClose = nextInfo.ch === ',' || nextInfo.ch === '}' || nextInfo.ch === ']' || nextInfo.ch === '';
          if (nextInfo.ch === ']' || nextInfo.ch === '}') {
            const after = skipWhitespace(nextInfo.index + 1);
            if (after.ch === '"') {
              shouldClose = false;
            }
          }
        }

        if (shouldClose) {
          inString = false;
          stringMode = 'value';
          sanitized += '"';
          continue;
        }

        sanitized += '\\"';
        continue;
      }

      const code = ch.charCodeAt(0);
      if (code <= 0x1F) {
        if (ch === '\n') sanitized += '\\n';
        else if (ch === '\r') sanitized += '\\r';
        else if (ch === '\t') sanitized += '\\t';
        else sanitized += `\\u${code.toString(16).padStart(4, '0')}`;
        continue;
      }

      sanitized += ch;
      continue;
    }

    if (ch === '"') {
      inString = true;
      const top = stack[stack.length - 1];
      stringMode = top && top.type === 'object' && top.expectKey ? 'key' : 'value';
      sanitized += '"';
      continue;
    }

    if (ch === '{') {
      stack.push({ type: 'object', expectKey: true });
      sanitized += ch;
      continue;
    }

    if (ch === '[') {
      stack.push({ type: 'array' });
      sanitized += ch;
      continue;
    }

    if (ch === '}') {
      stack.pop();
      sanitized += ch;
      if (stack.length && stack[stack.length - 1].type === 'object') {
        stack[stack.length - 1].expectKey = false;
      }
      continue;
    }

    if (ch === ']') {
      stack.pop();
      sanitized += ch;
      continue;
    }

    if (ch === ':') {
      sanitized += ch;
      if (stack.length && stack[stack.length - 1].type === 'object') {
        stack[stack.length - 1].expectKey = false;
      }
      continue;
    }

    if (ch === ',') {
      sanitized += ch;
      if (stack.length && stack[stack.length - 1].type === 'object') {
        stack[stack.length - 1].expectKey = true;
      }
      continue;
    }

    sanitized += ch;
  }

  return sanitized;
};

const resolveUploadUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (/^https?:\/\//i.test(url)) return url;
  try {
    const backend = getBackendHost();
    if (!backend) return url;
    const normalizedBackend = backend.endsWith('/') ? backend.slice(0, -1) : backend;
    if (url.startsWith('/')) return `${normalizedBackend}${url}`;
    return `${normalizedBackend}/${url}`;
  } catch (_) {
    return url;
  }
};

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

const parseJsonPayload = (rawText) => {
  if (!rawText) return null;
  try {
    return JSON.parse(rawText);
  } catch (error) {
    try {
      return JSON.parse(sanitizeJsonString(rawText));
    } catch (inner) {
      const posMatch = /position (\d+)/.exec(inner?.message || '');
      const pos = posMatch ? Number(posMatch[1]) : 0;
      const start = pos > 120 ? pos - 120 : 0;
      const end = pos + 120;
      console.error('[EasyUpload] JSON parsing failed', inner, rawText.slice(start, end));
      return null;
    }
  }
};

export default async function useEasyUpload(filesInput, options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  if (!config.fileUploadUrl) {
    throw new Error('fileUploadUrl is required.');
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

  if (config.extraFormData && typeof config.extraFormData === 'object') {
    Object.entries(config.extraFormData).forEach(([key, value]) => {
      if (value == null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item != null) formData.append(key, item);
        });
      } else {
        formData.append(key, value);
      }
    });
  }

  if (options.loading) {
    updateLoading(1);
  }
  try {
    const targetUrl = resolveUploadUrl(config.fileUploadUrl);
    const response = await fetch(targetUrl, {
      method: 'POST',
      body: formData,
      credentials: config.credentials,
      headers: config.headers,
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

    const parsed = parseJsonPayload(rawText);
    if (parsed && typeof parsed === 'object' && typeof parsed.result === 'string' && parsed.result.trim() !== '') {
      const nested = parseJsonPayload(parsed.result.trim());
      if (nested) parsed.result = nested;
    }
    return parsed;
  } catch (error) {
    if (!error?.message) {
      showAlert('파일 업로드 중 알 수 없는 오류가 발생했습니다.', { title: '업로드 실패', type: 'error' });
    }
    throw error;
  } finally {
    updateLoading(-1);
  }
}
