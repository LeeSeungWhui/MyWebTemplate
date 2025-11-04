// Canvas stub for browser-only builds. Pdf.js tries to require the native canvas
// module on the server, but our viewer runs entirely on the client.
// Export a proxy that safely no-ops every access.
const noop = () => noop;
const proxy = new Proxy(noop, {
  get: () => proxy,
  apply: () => proxy,
  construct: () => proxy,
});

module.exports = proxy;
module.exports.default = proxy;
