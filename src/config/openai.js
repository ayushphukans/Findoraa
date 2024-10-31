import OpenAI from 'openai';

class OpenAIRateLimiter {
  constructor(apiKey) {
    console.log('🔧 Initializing OpenAI with key length:', apiKey?.length);
    
    try {
      this.openai = new OpenAI({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      });
      
      console.log('✅ OpenAI instance created:', 
        !!this.openai, 
        'has chat:', 
        !!this.openai?.chat,
        'has completions:',
        !!this.openai?.chat?.completions
      );
    } catch (error) {
      console.error('❌ OpenAI initialization error:', error);
      throw error;
    }
  }

  async createCompletion(options) {
    console.log('📝 Creating completion with options:', options);
    
    try {
      if (!this.openai?.chat?.completions) {
        console.error('❌ OpenAI instance not properly initialized:', this.openai);
        throw new Error('OpenAI not properly initialized');
      }

      const response = await this.openai.chat.completions.create(options);
      console.log('✅ OpenAI response received:', response);
      return response;
    } catch (error) {
      console.error('❌ OpenAI completion error:', error);
      throw error;
    }
  }
}

// Debug log environment
console.log('🔑 Environment check:', {
  hasKey: !!process.env.REACT_APP_OPENAI_API_KEY,
  keyLength: process.env.REACT_APP_OPENAI_API_KEY?.length,
  nodeEnv: process.env.NODE_ENV
});

const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
if (!apiKey) {
  console.error('❌ OpenAI API key missing');
  throw new Error('OpenAI API key is required');
}

export const openai = new OpenAIRateLimiter(apiKey);

export const testConnection = async () => {
  try {
    console.log('🔄 Testing OpenAI connection...');
    const response = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Test connection" }],
      max_tokens: 5
    });
    console.log('✅ Connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}; 
export default openai; 