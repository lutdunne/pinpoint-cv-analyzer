// Lazy initialization to avoid errors during build time
let _client = null;

export const getClient = () => {
  if (!_client) {
    // Import OpenAI dynamically to avoid build-time evaluation
    const OpenAI = require("openai").default;
    _client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return _client;
};

// Keep backward compatibility
export const client = new Proxy({}, {
  get(target, prop) {
    return getClient()[prop];
  }
});