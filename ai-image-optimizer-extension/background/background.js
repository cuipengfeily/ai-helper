// AI图片描述优化助手 - Background Service Worker

class AIOptimizerBackground {
  constructor() {
    this.config = null;
    this.loadConfig();
    this.setupMessageHandlers();
  }

  async loadConfig() {
    try {
      const configUrl = chrome.runtime.getURL('config/config.json');
      const response = await fetch(configUrl);
      this.config = await response.json();
    } catch (error) {
      console.error('Failed to load config:', error);
    }
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'optimizeDescription') {
        this.handleOptimizeDescription(request, sendResponse);
        return true; // 异步响应
      } else if (request.action === 'openOptions') {
        this.openOptionsPage();
      } else if (request.action === 'getConfig') {
        sendResponse({ config: this.config });
      }
    });
  }

  async handleOptimizeDescription(request, sendResponse) {
    try {
      const { prompt, modelId } = request;
      const result = await this.callAIModel(prompt, modelId);
      sendResponse({ result });
    } catch (error) {
      console.error('AI optimization failed:', error);
      sendResponse({ error: error.message });
    }
  }

  async callAIModel(prompt, modelId) {
    // 获取用户设置的API密钥
    const settings = await this.getSettings();
    const model = this.config.aiModels.find(m => m.id === modelId);
    
    if (!model) {
      throw new Error('未找到指定的AI模型');
    }

    // 根据不同的模型调用相应的API
    switch (modelId) {
      case 'openai-free':
        return await this.callOpenAI(prompt, settings.openaiApiKey);
      case 'claude-free':
        return await this.callClaude(prompt, settings.claudeApiKey);
      case 'gemini-free':
        return await this.callGemini(prompt, settings.geminiApiKey);
      case 'local-ollama':
        return await this.callOllama(prompt, settings.ollamaModel || 'llama2');
      default:
        throw new Error('不支持的AI模型');
    }
  }

  async callOpenAI(prompt, apiKey) {
    if (!apiKey) {
      throw new Error('请在设置中配置OpenAI API密钥');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`OpenAI API错误: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '生成失败';
  }

  async callClaude(prompt, apiKey) {
    if (!apiKey) {
      throw new Error('请在设置中配置Claude API密钥');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Claude API错误: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '生成失败';
  }

  async callGemini(prompt, apiKey) {
    if (!apiKey) {
      throw new Error('请在设置中配置Gemini API密钥');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7
        }
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Gemini API错误: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || '生成失败';
  }

  async callOllama(prompt, model) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama连接失败: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response || '生成失败';
    } catch (error) {
      throw new Error(`本地模型调用失败: ${error.message}。请确保Ollama服务正在运行。`);
    }
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get([
        'openaiApiKey',
        'claudeApiKey', 
        'geminiApiKey',
        'ollamaModel',
        'defaultModel'
      ], (result) => {
        resolve(result);
      });
    });
  }

  openOptionsPage() {
    chrome.runtime.openOptionsPage();
  }
}

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('AI图片描述优化助手已安装');
    // 设置默认配置
    chrome.storage.local.set({
      defaultModel: 'local-ollama',
      ollamaModel: 'llama2'
    });
  }
});

// 初始化背景脚本
new AIOptimizerBackground();