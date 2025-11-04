"use strict";

const stub = (method = 'canvas') => {
  throw new Error(`canvas stub: ${method} is not available in this environment.`);
};

const createCanvas = (...args) => {
  stub('createCanvas');
  return args;
};

const loadImage = async (...args) => {
  stub('loadImage');
  return args;
};

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
