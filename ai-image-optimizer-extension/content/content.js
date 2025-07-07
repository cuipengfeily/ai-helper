// AI图片描述优化助手 - Content Script
class AIImageOptimizer {
  constructor() {
    this.config = null;
    this.originalInput = null;
    this.optimizerContainer = null;
    this.isInitialized = false;
    
    this.init();
  }

  async init() {
    // 等待页面加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initOptimizer());
    } else {
      this.initOptimizer();
    }
  }

  async initOptimizer() {
    try {
      await this.loadConfig();
      await this.findTargetInput();
      if (this.originalInput && !this.isInitialized) {
        this.createOptimizerUI();
        this.isInitialized = true;
        console.log('AI图片描述优化助手已启动');
      }
    } catch (error) {
      console.error('初始化优化助手失败:', error);
    }
  }

  async loadConfig() {
    try {
      const configUrl = chrome.runtime.getURL('config/config.json');
      const response = await fetch(configUrl);
      this.config = await response.json();
    } catch (error) {
      console.error('加载配置文件失败:', error);
      throw error;
    }
  }

  async findTargetInput() {
    // 尝试多种选择器来找到输入框
    const selectors = [
      'textarea[placeholder*="输入"]',
      'textarea[placeholder*="描述"]',
      'input[placeholder*="输入"]',
      'input[placeholder*="描述"]',
      '.input-area textarea',
      '.prompt-input',
      '[class*="input"] textarea',
      '[id*="input"] textarea'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        this.originalInput = element;
        console.log('找到目标输入框:', selector);
        return;
      }
    }

    // 如果直接查找失败，等待一段时间后重试
    await this.waitForInput();
  }

  async waitForInput() {
    return new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            const input = document.querySelector('textarea, input[type="text"]');
            if (input) {
              this.originalInput = input;
              observer.disconnect();
              resolve();
              return;
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // 30秒后停止观察
      setTimeout(() => {
        observer.disconnect();
        resolve();
      }, 30000);
    });
  }

  createOptimizerUI() {
    // 创建主容器
    this.optimizerContainer = document.createElement('div');
    this.optimizerContainer.id = 'ai-image-optimizer';
    this.optimizerContainer.className = 'ai-optimizer-container';

    // 创建HTML结构
    this.optimizerContainer.innerHTML = this.getOptimizerHTML();

    // 插入到原始输入框下方
    this.originalInput.parentNode.insertBefore(
      this.optimizerContainer,
      this.originalInput.nextSibling
    );

    // 绑定事件
    this.bindEvents();
    
    // 初始化下拉菜单
    this.initializeDropdowns();
  }

  getOptimizerHTML() {
    const categoriesHTML = this.config.categories.map(category => `
      <div class="optimizer-row">
        <label class="optimizer-label">
          <span class="optimizer-icon">${category.icon}</span>
          ${category.name}:
        </label>
        <select class="optimizer-select" data-category="${category.key}">
          ${category.options.map(option => 
            `<option value="${option.value}">${option.label}</option>`
          ).join('')}
        </select>
      </div>
    `).join('');

    const modelsHTML = this.config.aiModels.map(model => 
      `<option value="${model.id}">${model.name}</option>`
    ).join('');

    return `
      <div class="optimizer-header">
        <div class="optimizer-title">
          <span class="optimizer-main-icon">📊</span>
          <span>图片描述优化助手</span>
        </div>
        <button class="optimizer-settings-btn" id="optimizerSettings">🔧 设置</button>
      </div>
      
      <div class="optimizer-content">
        ${categoriesHTML}
        
        <div class="optimizer-row">
          <label class="optimizer-label">
            <span class="optimizer-icon">🤖</span>
            AI模型:
          </label>
          <select class="optimizer-select" id="aiModelSelect">
            ${modelsHTML}
          </select>
        </div>
        
        <div class="optimizer-actions">
          <button class="optimizer-btn optimizer-btn-primary" id="optimizeBtn">
            🚀 优化描述
          </button>
        </div>
        
        <div class="optimizer-result-section">
          <label class="optimizer-label">
            <span class="optimizer-icon">📝</span>
            优化后的描述:
          </label>
          <div class="optimizer-result-container">
            <textarea 
              class="optimizer-result" 
              id="optimizedResult" 
              placeholder="优化后的图片描述将在这里显示..."
              readonly
            ></textarea>
            <div class="optimizer-result-actions">
              <button class="optimizer-btn optimizer-btn-secondary" id="copyBtn">
                📋 复制
              </button>
              <button class="optimizer-btn optimizer-btn-secondary" id="applyBtn">
                📤 应用
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="optimizer-loading" id="optimizerLoading" style="display: none;">
        <div class="loading-spinner"></div>
        <span>正在优化描述...</span>
      </div>
    `;
  }

  bindEvents() {
    // 优化按钮事件
    document.getElementById('optimizeBtn').addEventListener('click', () => {
      this.optimizeDescription();
    });

    // 复制按钮事件
    document.getElementById('copyBtn').addEventListener('click', () => {
      this.copyResult();
    });

    // 应用按钮事件
    document.getElementById('applyBtn').addEventListener('click', () => {
      this.applyResult();
    });

    // 设置按钮事件
    document.getElementById('optimizerSettings').addEventListener('click', () => {
      this.openSettings();
    });
  }

  initializeDropdowns() {
    // 从存储中恢复用户之前的选择
    chrome.storage.local.get(['userPreferences'], (result) => {
      if (result.userPreferences) {
        Object.entries(result.userPreferences).forEach(([key, value]) => {
          const select = document.querySelector(`[data-category="${key}"]`);
          if (select) {
            select.value = value;
          }
        });
      }
    });

    // 监听下拉菜单变化，保存用户偏好
    const selects = document.querySelectorAll('.optimizer-select[data-category]');
    selects.forEach(select => {
      select.addEventListener('change', () => {
        this.saveUserPreferences();
      });
    });
  }

  saveUserPreferences() {
    const preferences = {};
    const selects = document.querySelectorAll('.optimizer-select[data-category]');
    
    selects.forEach(select => {
      const category = select.dataset.category;
      preferences[category] = select.value;
    });

    chrome.storage.local.set({ userPreferences: preferences });
  }

  async optimizeDescription() {
    const loadingEl = document.getElementById('optimizerLoading');
    const resultEl = document.getElementById('optimizedResult');
    
    try {
      // 显示加载状态
      loadingEl.style.display = 'flex';
      resultEl.value = '';

      // 获取原始描述
      const originalText = this.originalInput.value.trim();
      
      // 获取用户选择的特征
      const features = this.getSelectedFeatures();
      
      // 构建提示词
      const prompt = this.buildPrompt(originalText, features);
      
      // 调用AI API
      const result = await this.callAI(prompt);
      
      // 显示结果
      resultEl.value = result;
      
    } catch (error) {
      console.error('优化失败:', error);
      resultEl.value = '优化失败，请检查网络连接或API配置。错误: ' + error.message;
    } finally {
      loadingEl.style.display = 'none';
    }
  }

  getSelectedFeatures() {
    const features = [];
    const selects = document.querySelectorAll('.optimizer-select[data-category]');
    
    selects.forEach(select => {
      const value = select.value;
      if (value) {
        const category = this.config.categories.find(cat => cat.key === select.dataset.category);
        const option = category.options.find(opt => opt.value === value);
        if (option && option.prompt) {
          features.push(option.prompt);
        }
      }
    });
    
    return features;
  }

  buildPrompt(originalText, features) {
    const featuresText = features.join(', ');
    
    if (originalText) {
      // 有原始内容，进行优化
      return this.config.prompts.optimize
        .replace('{originalText}', originalText)
        .replace('{features}', featuresText);
    } else {
      // 无原始内容，生成新描述
      return this.config.prompts.generate
        .replace('{features}', featuresText);
    }
  }

  async callAI(prompt) {
    return new Promise((resolve, reject) => {
      // 向background script发送消息
      chrome.runtime.sendMessage({
        action: 'optimizeDescription',
        prompt: prompt,
        modelId: document.getElementById('aiModelSelect').value
      }, (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.result);
        }
      });
    });
  }

  copyResult() {
    const resultEl = document.getElementById('optimizedResult');
    const text = resultEl.value;
    
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('已复制到剪贴板');
      }).catch(err => {
        console.error('复制失败:', err);
        this.showToast('复制失败');
      });
    }
  }

  applyResult() {
    const resultEl = document.getElementById('optimizedResult');
    const text = resultEl.value;
    
    if (text && this.originalInput) {
      this.originalInput.value = text;
      this.originalInput.dispatchEvent(new Event('input', { bubbles: true }));
      this.originalInput.dispatchEvent(new Event('change', { bubbles: true }));
      this.showToast('已应用优化结果');
    }
  }

  openSettings() {
    chrome.runtime.sendMessage({ action: 'openOptions' });
  }

  showToast(message) {
    // 创建toast提示
    const toast = document.createElement('div');
    toast.className = 'optimizer-toast';
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 2000);
  }
}

// 初始化插件
new AIImageOptimizer();