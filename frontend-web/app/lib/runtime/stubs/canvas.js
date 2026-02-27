"use strict";

/**
 * 파일명: canvas.js
 * 작성자: LSH
 * 갱신일: 2025-11-04
 * 설명: 서버 환경에서 canvas 네이티브 모듈 접근을 차단하는 런타임 스텁
 */

/**
 * 공통 스텁 헬퍼
 * @param {string} method - 호출된 메서드 이름
 * @description 서버 런타임에서 canvas API 호출을 즉시 예외로 차단한다.
 * 실패 동작: 항상 Error를 throw한다.
 * @updated 2026-02-27
 */
const stub = (method = 'canvas') => {
  throw new Error(`canvas stub: ${method} is not available in this environment.`);
};

/**
 * 캔버스 생성 시도 차단
 * @returns {never}
 * @description createCanvas 호출 경로를 stub으로 연결한다.
 * @updated 2026-02-27
 */
const createCanvas = (...args) => {
  stub('createCanvas');
  return args;
};

/**
 * 이미지 로드 시도 차단
 * @returns {Promise<never>}
 * @description loadImage 호출 경로를 stub으로 연결한다.
 * @updated 2026-02-27
 */
const loadImage = async (...args) => {
  stub('loadImage');
  return args;
};

/**
 * 폰트 등록 시도 차단
 * @returns {never}
 * @description registerFont 호출 경로를 stub으로 연결한다.
 * @updated 2026-02-27
 */
const registerFont = (...args) => {
  stub('registerFont');
  return args;
};

module.exports = {
  createCanvas,
  loadImage,
  registerFont,
};

module.exports.default = module.exports;
