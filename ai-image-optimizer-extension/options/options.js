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
        'maxHistoryCount'
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
        maxHistoryCount: parseInt(document.getElementById('maxHistoryCount').value)
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
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new OptionsManager();
});