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
 */
const stub = (method = 'canvas') => {
  throw new Error(`canvas stub: ${method} is not available in this environment.`);
};

/**
 * 캔버스 생성 시도 차단
 * @returns {never}
 */
const createCanvas = (...args) => {
  stub('createCanvas');
  return args;
};

/**
 * 이미지 로드 시도 차단
 * @returns {Promise<never>}
 */
const loadImage = async (...args) => {
  stub('loadImage');
  return args;
};

/**
 * 폰트 등록 시도 차단
 * @returns {never}
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
