import { useState, useCallback } from 'react';
import { Alert } from '../..';
const DEFAULT_MESSAGE = 'EasyUpload.jsx에 파일 업로드 api를 입력하세요.';

const useEasyUpload = ({ imageUploadUrl, fileUploadUrl } = {}) => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState(DEFAULT_MESSAGE);

  const showAlert = useCallback((message = DEFAULT_MESSAGE) => {
    setAlertMessage(message);
    setAlertOpen(true);
  }, []);

  const uploadImage = useCallback(async (file) => {
    if (imageUploadUrl) {
      showAlert('이미지 업로드 API를 EasyUpload.jsx에 구현하세요.');
    } else {
      showAlert();
    }
    console.info('[EasyUpload] 이미지 업로드는 프로젝트별 구현이 필요합니다.', { imageUploadUrl, file });
    return null;
  }, [imageUploadUrl, showAlert]);

  const uploadFile = useCallback(async (file) => {
    if (fileUploadUrl) {
      showAlert('파일 업로드 API를 EasyUpload.jsx에 구현하세요.');
    } else {
      showAlert();
    }
    console.info('[EasyUpload] 파일 업로드는 프로젝트별 구현이 필요합니다.', { fileUploadUrl, file });
    return null;
  }, [fileUploadUrl, showAlert]);

  const alertElement = alertOpen ? (
    <Alert
      title="업로드 미구현"
      text={alertMessage}
      onClick={() => setAlertOpen(false)}
    />
  ) : null;

  return {
    uploadImage,
    uploadFile,
    alertElement,
  };
};

export default useEasyUpload;
