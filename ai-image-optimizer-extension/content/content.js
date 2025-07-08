// AI图片描述优化助手 - Content Script
class AIImageOptimizer {
  constructor() {
    this.config = null;
    this.originalInput = null;
    this.optimizerContainer = null;
    this.isInitialized = false;
    this.retryCount = 0;
    this.maxRetries = 5;
    
    this.init();
  }

  async init() {
    try {
      // 等待页面完全加载
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initOptimizer());
      } else {
        // 如果页面已经加载，延迟一点时间确保所有元素都已渲染
        setTimeout(() => this.initOptimizer(), 1000);
      }

      // 监听设置变化
      this.listenForSettingsChanges();
      
      // 监听来自设置页面的消息
      this.listenForMessages();
    } catch (error) {
      console.error('AI图片描述优化助手初始化失败:', error);
    }
  }

  async initOptimizer() {
    try {
      console.log('开始初始化AI图片描述优化助手...');
      
      // 检查是否已经初始化
      if (this.isInitialized) {
        console.log('插件已经初始化，跳过重复初始化');
        return;
      }

      // 加载配置和用户设置
      await this.loadConfig();
      await this.loadUserSettings();
      
      // 查找目标输入框
      await this.findTargetInput();
      
      // 如果找到输入框且未初始化，创建UI
      if (this.originalInput && !this.isInitialized) {
        this.createOptimizerUI();
        this.isInitialized = true;
        console.log('AI图片描述优化助手已成功启动');
      } else if (!this.originalInput && this.retryCount < this.maxRetries) {
        // 如果没找到输入框，重试
        this.retryCount++;
        console.log(`未找到输入框，${this.retryCount}/${this.maxRetries} 次重试...`);
        setTimeout(() => this.initOptimizer(), 2000);
      } else if (this.retryCount >= this.maxRetries) {
        console.log('达到最大重试次数，停止初始化');
      }
    } catch (error) {
      console.error('初始化优化助手失败:', error);
      // 如果是配置加载失败，使用默认配置
      if (!this.config) {
        console.log('使用默认配置重试...');
        this.config = this.getDefaultConfig();
        setTimeout(() => this.initOptimizer(), 1000);
      }
    }
  }

  getDefaultConfig() {
    return {
      version: "1.0.0",
      defaultModel: "local-ollama",
      categories: [
        {
          "key": "style",
          "name": "图片风格",
          "icon": "🎨",
          "options": [
            {"value": "", "label": "请选择风格", "prompt": ""},
            {"value": "cartoon", "label": "卡通风格", "prompt": "cartoon style, animated"},
            {"value": "realistic", "label": "写实风格", "prompt": "photorealistic, highly detailed"}
          ]
        },
        {
          "key": "character",
          "name": "人物特征",
          "icon": "🎭",
          "options": [
            {"value": "", "label": "请选择人物", "prompt": ""},
            {"value": "modern", "label": "现代人物", "prompt": "modern character, contemporary"},
            {"value": "anime_char", "label": "动漫角色", "prompt": "anime character, manga style"}
          ]
        }
      ],
      aiModels: [
        {
          "id": "openai-free",
          "name": "ChatGPT (免费)",
          "apiUrl": "https://api.openai.com/v1/chat/completions",
          "free": true,
          "needsApiKey": true,
          "description": "使用OpenAI的ChatGPT模型"
        }
      ],
      prompts: {
        "optimize": "请基于用户原始的图片描述：'{originalText}'，结合以下特征要求：{features}，生成一个更加详细、生动、适合AI图片生成的优化描述。要求：1）保持原意不变；2）增加视觉细节；3）使用适合AI理解的关键词；4）控制在150字以内。只返回优化后的描述，不要其他解释。",
        "generate": "请根据以下图片特征要求：{features}，生成一个详细、生动、适合AI图片生成的完整描述。要求：1）画面要有主体内容；2）包含丰富的视觉细节；3）使用适合AI理解的关键词；4）控制在150字以内。只返回图片描述，不要其他解释。"
      }
    };
  }

  async loadConfig() {
    try {
      const configUrl = chrome.runtime.getURL('config/config.json');
      console.log('尝试加载配置文件:', configUrl);
      
      const response = await fetch(configUrl);
      if (!response.ok) {
        throw new Error(`配置文件加载失败: ${response.status}`);
      }
      
      this.config = await response.json();
      console.log('配置文件加载成功');
    } catch (error) {
      console.error('加载配置文件失败:', error);
      // 使用默认配置
      this.config = this.getDefaultConfig();
      console.log('使用默认配置');
    }
  }

  async loadUserSettings() {
    try {
      const settings = await chrome.storage.local.get([
        'insertPosition',
        'displayMode',
        'customSelector'
      ]);
      
      this.userSettings = {
        insertPosition: settings.insertPosition || 'body-top',
        displayMode: settings.displayMode || 'fixed', // 默认使用固定定位（悬浮显示）
        customSelector: settings.customSelector || ''
      };
      
      console.log('用户设置加载成功:', this.userSettings);
    } catch (error) {
      console.error('加载用户设置失败:', error);
      this.userSettings = {
        insertPosition: 'body-top',
        displayMode: 'fixed',
        customSelector: ''
      };
    }
  }

  async findTargetInput() {
    // 尝试多种选择器来找到输入框
    const selectors = [
      'textarea[placeholder*="输入"]',
      'textarea[placeholder*="描述"]',
      'textarea[placeholder*="prompt"]',
      'input[placeholder*="输入"]',
      'input[placeholder*="描述"]',
      'input[placeholder*="prompt"]',
      '.input-area textarea',
      '.prompt-input',
      '[class*="input"] textarea',
      '[id*="input"] textarea',
      'textarea',
      'input[type="text"]'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        // 检查元素是否可见且可编辑
        if (this.isElementVisible(element) && this.isElementEditable(element)) {
          this.originalInput = element;
          console.log('找到目标输入框:', selector, element);
          return;
        }
      }
    }

    // 如果直接查找失败，等待一段时间后重试
    await this.waitForInput();
  }

  isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }

  isElementEditable(element) {
    return !element.readOnly && 
           !element.disabled && 
           (element.tagName === 'TEXTAREA' || 
            (element.tagName === 'INPUT' && element.type === 'text'));
  }

  async waitForInput() {
    return new Promise((resolve) => {
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            const inputs = document.querySelectorAll('textarea, input[type="text"]');
            for (const input of inputs) {
              if (this.isElementVisible(input) && this.isElementEditable(input)) {
                this.originalInput = input;
                observer.disconnect();
                console.log('通过观察找到输入框:', input);
                resolve();
                return;
              }
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
        console.log('观察超时，未找到输入框');
        resolve();
      }, 30000);
    });
  }

  createOptimizerUI() {
    try {
      // 检查是否已经存在优化器UI
      if (document.getElementById('ai-image-optimizer')) {
        console.log('优化器UI已存在，跳过创建');
        return;
      }

      // 创建主容器
      this.optimizerContainer = document.createElement('div');
      this.optimizerContainer.id = 'ai-image-optimizer';
      
      // 根据显示模式设置CSS类
      const displayMode = this.userSettings?.displayMode || 'fixed';
      this.optimizerContainer.className = `ai-optimizer-container ${displayMode}-mode`;

      // 创建HTML结构
      const html = this.getOptimizerHTML();
      this.optimizerContainer.innerHTML = html;
      
      console.log('生成的HTML结构:', html);
      console.log('优化器容器:', this.optimizerContainer);

      // 根据用户设置选择插入位置
      const inserted = this.insertOptimizerUI();

      if (inserted) {
        // 绑定事件
        this.bindEvents();
        
        // 初始化下拉菜单
        this.initializeDropdowns();
        
        // 添加拖拽功能
        this.addDragFunctionality();
        
        // 恢复保存的位置和大小
        this.restorePluginPosition();
        
        // 初始化内容区域的高度和滚动
        this.adjustContentArea(this.optimizerContainer.offsetHeight);
        
        // 检查容器滚动
        this.checkContainerScroll(this.optimizerContainer.offsetWidth, this.optimizerContainer.offsetHeight);
        
        // 强制显示滚动条（调试用）
        this.forceShowScrollbar();
        
        // 动态注入滚动条CSS
        this.injectScrollbarCSS();
        
        console.log('优化器UI创建成功');
      }
    } catch (error) {
      console.error('创建优化器UI失败:', error);
    }
  }

  insertOptimizerUI() {
    const insertPosition = this.userSettings?.insertPosition || 'body-top';
    const customSelector = this.userSettings?.customSelector || '';
    
    console.log('使用插入位置设置:', insertPosition, customSelector);

    try {
      switch (insertPosition) {
        case 'body-top':
          // 插入到页面顶部
          document.body.insertBefore(this.optimizerContainer, document.body.firstChild);
          console.log('优化器UI已插入到页面顶部');
          return true;

        case 'body-bottom':
          // 插入到页面底部
          document.body.appendChild(this.optimizerContainer);
          console.log('优化器UI已插入到页面底部');
          return true;

        case 'input-parent':
          // 插入到输入框的父容器
          if (this.originalInput && this.originalInput.parentNode) {
            this.originalInput.parentNode.insertBefore(this.optimizerContainer, this.originalInput.nextSibling);
            console.log('优化器UI已插入到输入框父容器');
            return true;
          }
          break;

        case 'input-sibling':
          // 插入到输入框同级位置
          if (this.originalInput) {
            this.originalInput.parentNode.insertBefore(this.optimizerContainer, this.originalInput.nextSibling);
            console.log('优化器UI已插入到输入框同级位置');
            return true;
          }
          break;

        case 'main-container':
          // 插入到主容器
          const mainContainer = document.querySelector('main, .main, #main, .container, .content');
          if (mainContainer) {
            mainContainer.insertBefore(this.optimizerContainer, mainContainer.firstChild);
            console.log('优化器UI已插入到主容器');
            return true;
          }
          break;

        case 'custom':
          // 使用自定义选择器
          if (customSelector) {
            const targetElement = document.querySelector(customSelector);
            if (targetElement) {
              targetElement.appendChild(this.optimizerContainer);
              console.log('优化器UI已插入到自定义位置:', customSelector);
              return true;
            } else {
              console.log('自定义选择器未找到元素:', customSelector);
            }
          }
          break;
      }

      // 如果所有策略都失败，使用默认策略
      console.log('使用默认插入策略');
      document.body.insertBefore(this.optimizerContainer, document.body.firstChild);
      return true;

    } catch (error) {
      console.error('插入优化器UI失败:', error);
      // 最后的备用方案
      try {
        document.body.appendChild(this.optimizerContainer);
        console.log('使用备用插入方案');
        return true;
      } catch (fallbackError) {
        console.error('所有插入策略都失败了:', fallbackError);
        return false;
      }
    }
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
        <div class="optimizer-header-buttons">
          <button class="optimizer-settings-btn" id="optimizerSettings">🔧 设置</button>
          <button class="optimizer-close-btn" id="optimizerClose">✕</button>
        </div>
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
    `;
  }

  bindEvents() {
    try {
      console.log('开始绑定事件...');
      
      // 优化按钮事件
      const optimizeBtn = document.getElementById('optimizeBtn');
      if (optimizeBtn) {
        optimizeBtn.addEventListener('click', () => {
          this.optimizeDescription();
        });
        console.log('优化按钮事件绑定成功');
      } else {
        console.error('找不到优化按钮');
      }

      // 复制按钮事件
      const copyBtn = document.getElementById('copyBtn');
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          this.copyResult();
        });
        console.log('复制按钮事件绑定成功');
      } else {
        console.error('找不到复制按钮');
      }

      // 应用按钮事件
      const applyBtn = document.getElementById('applyBtn');
      if (applyBtn) {
        applyBtn.addEventListener('click', () => {
          this.applyResult();
        });
        console.log('应用按钮事件绑定成功');
      } else {
        console.error('找不到应用按钮');
      }

      // 设置按钮事件
      const settingsBtn = document.getElementById('optimizerSettings');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
          console.log('设置按钮被点击');
          this.openSettings();
        });
        console.log('设置按钮事件绑定成功');
      } else {
        console.error('找不到设置按钮 (optimizerSettings)');
        // 尝试查找所有可能的设置按钮
        const allButtons = document.querySelectorAll('button');
        console.log('页面中的所有按钮:', allButtons);
      }

      // 关闭按钮事件
      const closeBtn = document.getElementById('optimizerClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.closeOptimizer();
        });
        console.log('关闭按钮事件绑定成功');
      } else {
        console.error('找不到关闭按钮');
      }

      console.log('事件绑定完成');
    } catch (error) {
      console.error('事件绑定失败:', error);
    }
  }

  initializeDropdowns() {
    try {
      // 从存储中恢复用户之前的选择
      chrome.storage.local.get(['userPreferences', 'defaultModel'], (result) => {
        if (result.userPreferences) {
          Object.entries(result.userPreferences).forEach(([key, value]) => {
            const select = document.querySelector(`[data-category="${key}"]`);
            if (select) {
              select.value = value;
            }
          });
        }
        
        // 设置默认AI模型
        const modelSelect = document.getElementById('aiModelSelect');
        if (modelSelect) {
          modelSelect.value = result.defaultModel || 'local-ollama';
          console.log('设置默认AI模型:', modelSelect.value);
        } else {
          console.error('找不到AI模型选择器');
        }
      });

      // 监听下拉菜单变化，保存用户偏好
      const selects = document.querySelectorAll('.optimizer-select[data-category]');
      selects.forEach(select => {
        select.addEventListener('change', () => {
          this.saveUserPreferences();
        });
      });

      console.log('下拉菜单初始化成功');
    } catch (error) {
      console.error('下拉菜单初始化失败:', error);
    }
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
    try {
      const resultEl = document.getElementById('optimizedResult');
      
      if (!resultEl) {
        console.error('找不到结果文本框');
        return;
      }
      
      // 清空结果
      resultEl.value = '正在优化中，请稍候...';

      // 获取原始描述
      const originalText = this.originalInput ? this.originalInput.value.trim() : '';
      
      // 获取用户选择的特征
      const features = this.getSelectedFeatures();
      
      // 构建提示词
      const prompt = this.buildPrompt(originalText, features);
      
      console.log('发送到AI的提示词:', prompt);
      
      // 调用AI API
      const result = await this.callAI(prompt);
      
      // 显示结果
      resultEl.value = result;
      
    } catch (error) {
      console.error('优化失败:', error);
      const resultEl = document.getElementById('optimizedResult');
      if (resultEl) {
        resultEl.value = '优化失败，请检查网络连接或API配置。错误: ' + error.message;
      }
    }
  }

  getSelectedFeatures() {
    try {
      const features = [];
      const selects = document.querySelectorAll('.optimizer-select[data-category]');
      
      selects.forEach(select => {
        const value = select.value;
        if (value) {
          const category = this.config.categories.find(cat => cat.key === select.dataset.category);
          if (category) {
            const option = category.options.find(opt => opt.value === value);
            if (option && option.prompt) {
              features.push(option.prompt);
            }
          }
        }
      });
      
      return features;
    } catch (error) {
      console.error('获取选中特征失败:', error);
      return [];
    }
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
      // 获取AI模型选择器
      const modelSelect = document.getElementById('aiModelSelect');
      if (!modelSelect) {
        reject(new Error('找不到AI模型选择器'));
        return;
      }
      
      const modelId = modelSelect.value;
      if (!modelId) {
        reject(new Error('请选择AI模型'));
        return;
      }
      
      // 向background script发送消息
      chrome.runtime.sendMessage({
        action: 'optimizeDescription',
        prompt: prompt,
        modelId: modelId
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
    try {
      const resultEl = document.getElementById('optimizedResult');
      if (!resultEl) {
        console.error('找不到结果文本框');
        return;
      }
      
      const text = resultEl.value;
      
      if (text) {
        navigator.clipboard.writeText(text).then(() => {
          this.showToast('已复制到剪贴板');
        }).catch(err => {
          console.error('复制失败:', err);
          this.showToast('复制失败');
        });
      }
    } catch (error) {
      console.error('复制结果失败:', error);
      this.showToast('复制失败');
    }
  }

  applyResult() {
    try {
      const resultEl = document.getElementById('optimizedResult');
      if (!resultEl) {
        console.error('找不到结果文本框');
        return;
      }
      
      const text = resultEl.value;
      
      if (text && this.originalInput) {
        this.originalInput.value = text;
        this.originalInput.dispatchEvent(new Event('input', { bubbles: true }));
        this.originalInput.dispatchEvent(new Event('change', { bubbles: true }));
        this.showToast('已应用优化结果');
      }
    } catch (error) {
      console.error('应用结果失败:', error);
      this.showToast('应用失败');
    }
  }

  openSettings() {
    chrome.runtime.sendMessage({ action: 'openOptions' });
  }

  closeOptimizer() {
    try {
      if (this.optimizerContainer) {
        this.optimizerContainer.remove();
        this.isInitialized = false;
        console.log('优化器已关闭');
        this.showToast('优化器已关闭，刷新页面可重新启用');
      }
    } catch (error) {
      console.error('关闭优化器失败:', error);
    }
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

  listenForSettingsChanges() {
    // 监听存储变化
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        const relevantChanges = ['insertPosition', 'displayMode', 'customSelector'];
        const hasRelevantChanges = relevantChanges.some(key => changes[key]);
        
        if (hasRelevantChanges) {
          console.log('检测到设置变化，重新应用设置...');
          this.reapplySettings();
        }
      }
    });
  }

  async reapplySettings() {
    try {
      // 重新加载用户设置
      await this.loadUserSettings();
      
      // 如果插件已经初始化，重新创建UI
      if (this.isInitialized) {
        console.log('重新创建插件UI以应用新设置...');
        
        // 移除旧的UI
        if (this.optimizerContainer) {
          this.optimizerContainer.remove();
        }
        
        // 重置初始化状态
        this.isInitialized = false;
        
        // 重新创建UI
        this.createOptimizerUI();
        
        this.showToast('设置已应用，插件已重新加载');
      }
    } catch (error) {
      console.error('重新应用设置失败:', error);
    }
  }

  listenForMessages() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'reapplySettings') {
        console.log('收到重新应用设置的消息');
        this.reapplySettings();
        sendResponse({ success: true });
      }
    });
  }

  addDragFunctionality() {
    if (!this.optimizerContainer) return;

    const header = this.optimizerContainer.querySelector('.optimizer-header');
    if (!header) return;

    let isDragging = false;
    let startX, startY, startLeft, startTop;

    header.addEventListener('mousedown', (e) => {
      // 如果点击的是按钮，不启动拖拽
      if (e.target.tagName === 'BUTTON') return;
      
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      
      const rect = this.optimizerContainer.getBoundingClientRect();
      startLeft = rect.left;
      startTop = rect.top;
      
      // 移除transform，使用绝对定位
      this.optimizerContainer.style.transform = 'none';
      this.optimizerContainer.style.left = startLeft + 'px';
      this.optimizerContainer.style.top = startTop + 'px';
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      
      e.preventDefault();
    });

    const onMouseMove = (e) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      const newLeft = startLeft + deltaX;
      const newTop = startTop + deltaY;
      
      // 确保插件不会拖出屏幕
      const maxLeft = window.innerWidth - this.optimizerContainer.offsetWidth;
      const maxTop = window.innerHeight - this.optimizerContainer.offsetHeight;
      
      this.optimizerContainer.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
      this.optimizerContainer.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      // 保存位置
      this.savePluginPosition();
    };

    // 添加调整大小的功能
    this.addResizeFunctionality();
  }

  addResizeFunctionality() {
    // 固定插件大小为600*400像素
    if (!this.optimizerContainer) return;

    console.log('设置固定插件大小: 600*400像素');

    // 设置固定尺寸
    this.optimizerContainer.style.width = '600px';
    this.optimizerContainer.style.height = '400px';
    this.optimizerContainer.style.resize = 'none';
    this.optimizerContainer.style.minWidth = '600px';
    this.optimizerContainer.style.maxWidth = '600px';
    this.optimizerContainer.style.minHeight = '400px';
    this.optimizerContainer.style.maxHeight = '400px';

    // 调整内容区域的高度和滚动
    this.adjustContentArea(400);
    
    // 检查是否需要显示容器滚动条
    this.checkContainerScroll(600, 400);
    
    // 保存固定大小
    this.savePluginSize();
    
    console.log('插件大小已固定为600*400像素');
  }

  adjustContentArea(containerHeight) {
    // 获取内容区域 - 修复类名
    const contentArea = this.optimizerContainer.querySelector('.optimizer-content');
    if (!contentArea) {
      console.log('未找到内容区域，尝试其他选择器...');
      // 尝试其他可能的选择器
      const alternativeContent = this.optimizerContainer.querySelector('.ai-optimizer-content');
      if (alternativeContent) {
        console.log('找到替代内容区域');
        this.adjustContentAreaElement(alternativeContent, containerHeight);
      }
      return;
    }

    // 固定容器高度为400px，内容区域高度为300px（减去头部高度）
    const headerHeight = 60; // 头部大约60px
    const contentHeight = containerHeight - headerHeight;
    
    console.log('调整内容区域:', {
      containerHeight,
      headerHeight,
      contentHeight
    });

    // 设置内容区域高度
    contentArea.style.height = contentHeight + 'px';
    contentArea.style.maxHeight = contentHeight + 'px';
    contentArea.style.overflowY = 'auto';
    contentArea.style.overflowX = 'hidden';

    this.adjustContentAreaElement(contentArea, contentHeight);
  }

  adjustContentAreaElement(contentArea, containerHeight) {
    // 使用flex布局，让内容区域自动适应
    console.log('调整内容区域:', {
      containerHeight,
      contentAreaHeight: contentArea.offsetHeight,
      scrollHeight: contentArea.scrollHeight
    });

    // 移除固定高度限制，让flex布局自动计算
    contentArea.style.maxHeight = 'none';
    contentArea.style.height = 'auto';
    
    // 确保滚动功能正常工作
    contentArea.style.overflowY = 'auto';
    contentArea.style.overflowX = 'hidden';

    // 检查是否需要滚动条
    setTimeout(() => {
      if (contentArea.scrollHeight > contentArea.clientHeight) {
        contentArea.style.overflowY = 'auto';
        console.log('内容超出，显示滚动条');
      } else {
        contentArea.style.overflowY = 'hidden';
        console.log('内容未超出，隐藏滚动条');
      }
    }, 100);
  }

  checkContainerScroll(containerWidth, containerHeight) {
    if (!this.optimizerContainer) return;

    // 计算内容的总高度
    const header = this.optimizerContainer.querySelector('.optimizer-header');
    const content = this.optimizerContainer.querySelector('.optimizer-content');
    
    const headerHeight = header ? header.offsetHeight : 50;
    const contentHeight = content ? content.scrollHeight : 0;
    const totalContentHeight = headerHeight + contentHeight;
    
    console.log('检查容器滚动:', {
      containerHeight,
      totalContentHeight,
      headerHeight,
      contentHeight,
      containerScrollHeight: this.optimizerContainer.scrollHeight,
      containerClientHeight: this.optimizerContainer.clientHeight
    });

    // 强制设置滚动
    this.optimizerContainer.style.overflow = 'auto';
    this.optimizerContainer.style.overflowY = 'auto';
    this.optimizerContainer.style.overflowX = 'hidden';
    
    // 检查是否需要滚动条
    setTimeout(() => {
      const scrollHeight = this.optimizerContainer.scrollHeight;
      const clientHeight = this.optimizerContainer.clientHeight;
      
      if (scrollHeight > clientHeight) {
        console.log('容器内容超出，显示滚动条');
        this.optimizerContainer.style.overflow = 'auto';
      } else {
        console.log('容器内容未超出，隐藏滚动条');
        this.optimizerContainer.style.overflow = 'hidden';
      }
    }, 100);
  }

  forceShowScrollbar() {
    if (!this.optimizerContainer) return;
    
    console.log('强制显示滚动条...');
    
    // 强制设置滚动 - 应用到主容器
    this.optimizerContainer.style.overflow = 'auto';
    this.optimizerContainer.style.overflowY = 'auto';
    this.optimizerContainer.style.overflowX = 'hidden';
    
    // 设置容器高度较小以触发滚动
    this.optimizerContainer.style.height = '400px';
    
    // 确保内容足够高以触发滚动
    const content = this.optimizerContainer.querySelector('.optimizer-content');
    if (content) {
      content.style.minHeight = '600px';
      console.log('已设置内容最小高度为600px');
    }
    
    // 添加明显的滚动条样式
    this.optimizerContainer.style.setProperty('--scrollbar-width', '16px');
    this.optimizerContainer.style.setProperty('--scrollbar-color', 'rgba(255, 255, 255, 0.9)');
    
    // 确保容器有足够的内容来触发滚动
    const header = this.optimizerContainer.querySelector('.optimizer-header');
    const headerHeight = header ? header.offsetHeight : 50;
    const contentHeight = content ? content.scrollHeight : 0;
    
    console.log('容器尺寸信息:', {
      containerHeight: this.optimizerContainer.offsetHeight,
      headerHeight,
      contentHeight,
      totalContentHeight: headerHeight + contentHeight
    });
    
    // 如果内容不够高，强制增加高度
    if (contentHeight < 500) {
      content.style.minHeight = '800px';
      console.log('内容高度不足，已设置最小高度为800px');
    }
    
    // 强制应用滚动条样式
    this.optimizerContainer.style.setProperty('scrollbar-width', 'auto');
    this.optimizerContainer.style.setProperty('scrollbar-color', 'rgba(255, 255, 255, 0.9) rgba(255, 255, 255, 0.3)');
    
    console.log('滚动条设置完成');
  }

  injectScrollbarCSS() {
    try {
      console.log('注入滚动条CSS...');
      
      // 检查是否已经注入过
      if (document.getElementById('ai-optimizer-scrollbar-css')) {
        console.log('滚动条CSS已存在，跳过注入');
        return;
      }
      
      const style = document.createElement('style');
      style.id = 'ai-optimizer-scrollbar-css';
      style.textContent = `
        #ai-image-optimizer {
          overflow: auto !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }
        
        #ai-image-optimizer::-webkit-scrollbar {
          width: 16px !important;
          background: rgba(255, 255, 255, 0.2) !important;
          display: block !important;
        }
        
        #ai-image-optimizer::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.3) !important;
          border-radius: 8px !important;
          border: 1px solid rgba(255, 255, 255, 0.2) !important;
        }
        
        #ai-image-optimizer::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.9) !important;
          border-radius: 8px !important;
          border: 2px solid rgba(255, 255, 255, 0.5) !important;
          min-height: 40px !important;
        }
        
        #ai-image-optimizer::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 1) !important;
          border-color: rgba(255, 255, 255, 0.8) !important;
        }
        
        #ai-image-optimizer::-webkit-scrollbar-corner {
          background: rgba(255, 255, 255, 0.3) !important;
        }
        
        #ai-image-optimizer {
          scrollbar-width: auto !important;
          scrollbar-color: rgba(255, 255, 255, 0.9) rgba(255, 255, 255, 0.3) !important;
        }
      `;
      
      document.head.appendChild(style);
      console.log('滚动条CSS注入成功');
      
      // 延迟应用样式
      setTimeout(() => {
        if (this.optimizerContainer) {
          this.optimizerContainer.style.overflow = 'auto';
          this.optimizerContainer.style.overflowY = 'auto';
          this.optimizerContainer.style.overflowX = 'hidden';
          console.log('滚动条样式已应用');
        }
      }, 100);
      
    } catch (error) {
      console.error('注入滚动条CSS失败:', error);
    }
  }

  savePluginPosition() {
    if (!this.optimizerContainer) return;
    
    const rect = this.optimizerContainer.getBoundingClientRect();
    const position = {
      left: rect.left,
      top: rect.top
    };
    
    chrome.storage.local.set({ pluginPosition: position });
  }

  savePluginSize() {
    if (!this.optimizerContainer) return;
    
    // 固定大小为600*400
    const size = {
      width: 600,
      height: 400
    };
    
    chrome.storage.local.set({ pluginSize: size });
    console.log('插件固定大小已保存:', size);
  }

  async restorePluginPosition() {
    try {
      const data = await chrome.storage.local.get(['pluginPosition']);
      
      if (data.pluginPosition && this.optimizerContainer) {
        this.optimizerContainer.style.transform = 'none';
        this.optimizerContainer.style.left = data.pluginPosition.left + 'px';
        this.optimizerContainer.style.top = data.pluginPosition.top + 'px';
      }
      
      // 确保使用固定大小
      if (this.optimizerContainer) {
        this.optimizerContainer.style.width = '600px';
        this.optimizerContainer.style.height = '400px';
        this.optimizerContainer.style.resize = 'none';
        this.optimizerContainer.style.minWidth = '600px';
        this.optimizerContainer.style.maxWidth = '600px';
        this.optimizerContainer.style.minHeight = '400px';
        this.optimizerContainer.style.maxHeight = '400px';
      }
    } catch (error) {
      console.error('恢复插件位置失败:', error);
    }
  }
}

// 初始化插件
new AIImageOptimizer();