// AI图片描述优化助手 - Options页面脚本

class OptionsManager {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadSettings();
    await this.loadStats();
    this.bindEvents();
  }

  async loadSettings() {
    try {
      const settings = await this.getStorageData([
        'defaultModel',
        'openaiApiKey',
        'claudeApiKey',
        'geminiApiKey',
        'ollamaModel',
        'ollamaUrl',
        'autoApplyResult',
        'saveHistory',
        'maxHistoryCount',
        'insertPosition',
        'displayMode',
        'customSelector'
      ]);

      // 设置默认值
      document.getElementById('defaultModel').value = settings.defaultModel || 'local-ollama';
      document.getElementById('openaiApiKey').value = settings.openaiApiKey || '';
      document.getElementById('claudeApiKey').value = settings.claudeApiKey || '';
      document.getElementById('geminiApiKey').value = settings.geminiApiKey || '';
      document.getElementById('ollamaModel').value = settings.ollamaModel || 'llama2';
      document.getElementById('ollamaUrl').value = settings.ollamaUrl || 'http://localhost:11434';
      document.getElementById('autoApplyResult').checked = settings.autoApplyResult || false;
      document.getElementById('saveHistory').checked = settings.saveHistory !== false; // 默认为true
      document.getElementById('maxHistoryCount').value = settings.maxHistoryCount || 50;
      document.getElementById('insertPosition').value = settings.insertPosition || 'body-top';
      document.getElementById('displayMode').value = settings.displayMode || 'fixed'; // 默认固定定位（悬浮显示）
      document.getElementById('customSelector').value = settings.customSelector || '';

    } catch (error) {
      console.error('加载设置失败:', error);
    }
  }

  async loadStats() {
    try {
      const data = await this.getStorageData(['usageStats', 'optimizationHistory']);
      const stats = data.usageStats || { daily: 0, total: 0, lastDate: null };
      const history = data.optimizationHistory || [];

      // 检查是否为新的一天
      const today = new Date().toDateString();
      if (stats.lastDate !== today) {
        stats.daily = 0;
        stats.lastDate = today;
      }

      document.getElementById('todayUsage').textContent = stats.daily;
      document.getElementById('totalUsage').textContent = stats.total;
      document.getElementById('historyCount').textContent = history.length;

    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  }

  bindEvents() {
    // 密码显示切换
    document.querySelectorAll('.toggle-password').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.target;
        const input = document.getElementById(targetId);
        
        if (input.type === 'password') {
          input.type = 'text';
          btn.textContent = '🙈';
        } else {
          input.type = 'password';
          btn.textContent = '👁️';
        }
      });
    });

    // 测试Ollama连接
    document.getElementById('testOllama').addEventListener('click', () => {
      this.testOllamaConnection();
    });

    // 保存设置
    document.getElementById('saveSettings').addEventListener('click', () => {
      this.saveSettings();
    });

    // 重置设置
    document.getElementById('resetSettings').addEventListener('click', () => {
      this.resetSettings();
    });

    // 数据管理
    document.getElementById('exportData').addEventListener('click', () => {
      this.exportData();
    });

    document.getElementById('importData').addEventListener('click', () => {
      document.getElementById('importFile').click();
    });

    document.getElementById('importFile').addEventListener('change', (e) => {
      this.importData(e.target.files[0]);
    });

    document.getElementById('clearData').addEventListener('click', () => {
      this.clearAllData();
    });

    // 实时保存某些设置
    document.getElementById('defaultModel').addEventListener('change', () => {
      this.saveSettings(false); // 不显示提示
    });

    // 插件显示设置
    document.getElementById('insertPosition').addEventListener('change', () => {
      this.handleInsertPositionChange();
    });

    document.getElementById('analyzePage').addEventListener('click', () => {
      this.analyzeCurrentPage();
    });

    // 添加应用设置按钮事件
    document.getElementById('applySettings').addEventListener('click', () => {
      this.applySettingsToCurrentPage();
    });
  }

  async testOllamaConnection() {
    const resultEl = document.getElementById('ollamaTestResult');
    const testBtn = document.getElementById('testOllama');
    const ollamaUrl = document.getElementById('ollamaUrl').value;
    const ollamaModel = document.getElementById('ollamaModel').value;

    // 显示加载状态
    testBtn.disabled = true;
    testBtn.textContent = '🔄 测试中...';
    resultEl.className = 'test-result';
    resultEl.style.display = 'none';

    try {
      // 测试连接
      const response = await fetch(`${ollamaUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: ollamaModel,
          prompt: 'Hello',
          stream: false
        })
      });

      if (response.ok) {
        resultEl.className = 'test-result success';
        resultEl.textContent = `✅ 连接成功！模型 ${ollamaModel} 可正常使用。`;
      } else {
        throw new Error(`连接失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      resultEl.className = 'test-result error';
      resultEl.textContent = `❌ 连接失败: ${error.message}。请检查Ollama是否正在运行。`;
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = '🔧 测试本地模型连接';
      resultEl.style.display = 'block';
    }
  }

  async saveSettings(showToast = true) {
    try {
      const settings = {
        defaultModel: document.getElementById('defaultModel').value,
        openaiApiKey: document.getElementById('openaiApiKey').value,
        claudeApiKey: document.getElementById('claudeApiKey').value,
        geminiApiKey: document.getElementById('geminiApiKey').value,
        ollamaModel: document.getElementById('ollamaModel').value,
        ollamaUrl: document.getElementById('ollamaUrl').value,
        autoApplyResult: document.getElementById('autoApplyResult').checked,
        saveHistory: document.getElementById('saveHistory').checked,
        maxHistoryCount: parseInt(document.getElementById('maxHistoryCount').value),
        insertPosition: document.getElementById('insertPosition').value,
        displayMode: document.getElementById('displayMode').value,
        customSelector: document.getElementById('customSelector').value
      };

      await chrome.storage.local.set(settings);

      if (showToast) {
        this.showToast('设置已保存成功！', 'success');
      }

    } catch (error) {
      console.error('保存设置失败:', error);
      this.showToast('保存设置失败！', 'error');
    }
  }

  async resetSettings() {
    if (!confirm('确定要重置所有设置吗？此操作不可撤销。')) {
      return;
    }

    try {
      // 清除所有设置
      await chrome.storage.local.clear();

      // 重新加载默认设置
      await this.loadSettings();
      await this.loadStats();

      this.showToast('设置已重置！', 'success');
    } catch (error) {
      console.error('重置设置失败:', error);
      this.showToast('重置设置失败！', 'error');
    }
  }

  async exportData() {
    try {
      const data = await this.getStorageData(null); // 获取所有数据
      
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        settings: data,
        // 移除敏感信息
        settings: {
          ...data,
          openaiApiKey: data.openaiApiKey ? '***' : '',
          claudeApiKey: data.claudeApiKey ? '***' : '',
          geminiApiKey: data.geminiApiKey ? '***' : ''
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-optimizer-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showToast('数据导出成功！', 'success');
    } catch (error) {
      console.error('导出数据失败:', error);
      this.showToast('导出数据失败！', 'error');
    }
  }

  async importData(file) {
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.version || !data.settings) {
        throw new Error('文件格式不正确');
      }

      // 确认导入
      if (!confirm('确定要导入此配置吗？当前设置将被覆盖。')) {
        return;
      }

      // 过滤敏感数据（不导入API密钥）
      const { openaiApiKey, claudeApiKey, geminiApiKey, ...safeSettings } = data.settings;

      await chrome.storage.local.set(safeSettings);
      await this.loadSettings();
      await this.loadStats();

      this.showToast('数据导入成功！API密钥需要重新配置。', 'success');
    } catch (error) {
      console.error('导入数据失败:', error);
      this.showToast('导入数据失败：' + error.message, 'error');
    }
  }

  async clearAllData() {
    const confirmText = '确定要清除所有数据吗？这将删除设置、历史记录和统计信息，此操作不可撤销。\n\n请输入"确认清除"来确认操作：';
    const userInput = prompt(confirmText);

    if (userInput !== '确认清除') {
      return;
    }

    try {
      await chrome.storage.local.clear();
      await this.loadSettings();
      await this.loadStats();

      this.showToast('所有数据已清除！', 'success');
    } catch (error) {
      console.error('清除数据失败:', error);
      this.showToast('清除数据失败！', 'error');
    }
  }

  showToast(message, type = 'success') {
    const toast = document.getElementById('saveToast');
    const icon = toast.querySelector('.toast-icon');
    const text = toast.querySelector('.toast-text');

    // 设置图标和文本
    icon.textContent = type === 'success' ? '✅' : '❌';
    text.textContent = message;

    // 设置颜色
    if (type === 'error') {
      toast.style.background = '#dc3545';
    } else {
      toast.style.background = '#28a745';
    }

    // 显示toast
    toast.style.display = 'flex';

    // 3秒后隐藏
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }

  getStorageData(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  }

  handleInsertPositionChange() {
    const insertPosition = document.getElementById('insertPosition').value;
    const customSelectorGroup = document.getElementById('customSelectorGroup');
    
    if (insertPosition === 'custom') {
      customSelectorGroup.style.display = 'block';
    } else {
      customSelectorGroup.style.display = 'none';
    }
  }

  async analyzeCurrentPage() {
    const resultEl = document.getElementById('pageAnalysisResult');
    const analyzeBtn = document.getElementById('analyzePage');
    
    // 显示加载状态
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = '🔄 分析中...';
    resultEl.className = 'analysis-result';
    resultEl.style.display = 'none';

    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        throw new Error('无法获取当前标签页');
      }

      console.log('当前标签页:', tab);

      // 检查是否有权限访问该页面
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
        throw new Error('无法分析此页面，请在目标网站上打开设置页面');
      }

      // 在目标页面执行分析脚本
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: this.analyzePageStructure
      });

      if (results && results[0] && results[0].result) {
        const analysis = results[0].result;
        this.displayPageAnalysis(analysis);
      } else {
        throw new Error('页面分析失败');
      }

    } catch (error) {
      console.error('页面分析错误:', error);
      resultEl.className = 'analysis-result error';
      resultEl.innerHTML = `
        <h4>❌ 分析失败</h4>
        <p>错误信息: ${error.message}</p>
        <p>请确保您在目标网站上打开此设置页面。</p>
        <p>当前页面URL: ${window.location.href}</p>
      `;
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = '🔍 分析当前页面结构';
      resultEl.style.display = 'block';
    }
  }

  analyzePageStructure() {
    const analysis = {
      url: window.location.href,
      title: document.title,
      inputElements: [],
      containerElements: [],
      bodyStructure: []
    };

    // 查找输入框元素
    const inputs = document.querySelectorAll('textarea, input[type="text"], input[placeholder*="输入"], input[placeholder*="描述"]');
    inputs.forEach((input, index) => {
      const rect = input.getBoundingClientRect();
      analysis.inputElements.push({
        index: index + 1,
        tagName: input.tagName,
        id: input.id || '',
        className: input.className || '',
        placeholder: input.placeholder || '',
        visible: rect.width > 0 && rect.height > 0,
        position: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        },
        parentPath: this.getElementPath(input.parentElement)
      });
    });

    // 查找主要容器元素
    const containers = document.querySelectorAll('main, .main, #main, .container, .content, [class*="container"], [class*="content"]');
    containers.forEach((container, index) => {
      const rect = container.getBoundingClientRect();
      analysis.containerElements.push({
        index: index + 1,
        tagName: container.tagName,
        id: container.id || '',
        className: container.className || '',
        visible: rect.width > 0 && rect.height > 0,
        position: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        },
        path: this.getElementPath(container)
      });
    });

    // 分析body结构（前5层）
    analysis.bodyStructure = this.analyzeBodyStructure(document.body, 0, 5);

    return analysis;
  }

  getElementPath(element, maxDepth = 10) {
    const path = [];
    let current = element;
    let depth = 0;

    while (current && current !== document.body && depth < maxDepth) {
      let selector = current.tagName.toLowerCase();
      
      if (current.id) {
        selector += `#${current.id}`;
      } else if (current.className) {
        const classes = current.className.split(' ').filter(c => c.trim()).slice(0, 2);
        if (classes.length > 0) {
          selector += `.${classes.join('.')}`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
      depth++;
    }

    return path.join(' > ');
  }

  analyzeBodyStructure(element, depth, maxDepth) {
    if (depth >= maxDepth || !element) {
      return [];
    }

    const structure = [];
    const children = Array.from(element.children).slice(0, 10); // 只分析前10个子元素

    children.forEach((child, index) => {
      const rect = child.getBoundingClientRect();
      structure.push({
        depth: depth + 1,
        index: index + 1,
        tagName: child.tagName,
        id: child.id || '',
        className: child.className || '',
        visible: rect.width > 0 && rect.height > 0,
        hasChildren: child.children.length > 0,
        path: this.getElementPath(child)
      });
    });

    return structure;
  }

  displayPageAnalysis(analysis) {
    const resultEl = document.getElementById('pageAnalysisResult');
    
    let html = `
      <h4>📊 页面分析结果</h4>
      <p><strong>页面:</strong> ${analysis.title}</p>
      <p><strong>URL:</strong> ${analysis.url}</p>
    `;

    // 显示输入框信息
    if (analysis.inputElements.length > 0) {
      html += `
        <h5>📝 找到的输入框 (${analysis.inputElements.length}个)</h5>
        <div class="analysis-items">
      `;
      
      analysis.inputElements.forEach(input => {
        html += `
          <div class="analysis-item">
            <strong>输入框 ${input.index}:</strong> ${input.tagName}
            ${input.id ? `#${input.id}` : ''}
            ${input.className ? `.${input.className.split(' ')[0]}` : ''}
            ${input.placeholder ? `[placeholder="${input.placeholder}"]` : ''}
            <br>
            <small>位置: ${input.parentPath}</small>
            <br>
            <small>可见: ${input.visible ? '✅' : '❌'}</small>
          </div>
        `;
      });
      
      html += '</div>';
    } else {
      html += '<p>❌ 未找到输入框元素</p>';
    }

    // 显示容器信息
    if (analysis.containerElements.length > 0) {
      html += `
        <h5>📦 主要容器 (${analysis.containerElements.length}个)</h5>
        <div class="analysis-items">
      `;
      
      analysis.containerElements.forEach(container => {
        html += `
          <div class="analysis-item">
            <strong>容器 ${container.index}:</strong> ${container.tagName}
            ${container.id ? `#${container.id}` : ''}
            ${container.className ? `.${container.className.split(' ')[0]}` : ''}
            <br>
            <small>路径: ${container.path}</small>
            <br>
            <small>可见: ${container.visible ? '✅' : '❌'}</small>
          </div>
        `;
      });
      
      html += '</div>';
    }

    // 显示body结构
    html += `
      <h5>🌳 Body结构 (前5层)</h5>
      <div class="analysis-items">
    `;
    
    analysis.bodyStructure.forEach(item => {
      const indent = '&nbsp;'.repeat(item.depth * 4);
      html += `
        <div class="analysis-item">
          ${indent}${item.tagName}
          ${item.id ? `#${item.id}` : ''}
          ${item.className ? `.${item.className.split(' ')[0]}` : ''}
          ${item.hasChildren ? ' (有子元素)' : ''}
          <br>
          <small>${indent}路径: ${item.path}</small>
        </div>
      `;
    });
    
    html += '</div>';

    resultEl.className = 'analysis-result success';
    resultEl.innerHTML = html;
  }

  async applySettingsToCurrentPage() {
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab) {
        throw new Error('无法获取当前标签页');
      }

      // 检查是否在目标网站上
      if (!tab.url || !tab.url.includes('jimeng.jianying.com')) {
        this.showToast('请在剪映AI工具网站上使用此功能', 'error');
        return;
      }

      // 向内容脚本发送消息，要求重新应用设置
      await chrome.tabs.sendMessage(tab.id, { action: 'reapplySettings' });
      
      this.showToast('设置已应用到当前页面', 'success');
      
    } catch (error) {
      console.error('应用设置失败:', error);
      this.showToast('应用设置失败: ' + error.message, 'error');
    }
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
});