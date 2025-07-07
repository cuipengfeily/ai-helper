// AI图片描述优化助手 - Popup脚本

class PopupManager {
  constructor() {
    this.init();
  }

  async init() {
    await this.loadStatus();
    await this.loadStats();
    this.bindEvents();
  }

  async loadStatus() {
    try {
      // 检查当前活动标签页是否为目标网站
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const targetStatus = document.getElementById('targetStatus');
      
      if (tab && tab.url && tab.url.includes('jimeng.jianying.com')) {
        targetStatus.textContent = '已检测到剪映AI网站';
        targetStatus.style.color = '#28a745';
      } else {
        targetStatus.textContent = '未检测到目标网站';
        targetStatus.style.color = '#6c757d';
      }

      // 获取当前AI模型设置
      const settings = await this.getStorageData(['defaultModel']);
      const modelStatus = document.getElementById('modelStatus');
      
      switch (settings.defaultModel) {
        case 'openai-free':
          modelStatus.textContent = 'ChatGPT (免费)';
          break;
        case 'claude-free':
          modelStatus.textContent = 'Claude (免费)';
          break;
        case 'gemini-free':
          modelStatus.textContent = 'Gemini (免费)';
          break;
        case 'local-ollama':
        default:
          modelStatus.textContent = '本地模型 (Ollama)';
          break;
      }
    } catch (error) {
      console.error('加载状态失败:', error);
    }
  }

  async loadStats() {
    try {
      const stats = await this.getStorageData(['usageStats']);
      const usageStats = stats.usageStats || { daily: 0, total: 0, lastDate: null };
      
      // 检查是否为新的一天
      const today = new Date().toDateString();
      if (usageStats.lastDate !== today) {
        usageStats.daily = 0;
        usageStats.lastDate = today;
      }

      document.getElementById('usageCount').textContent = usageStats.daily;
      document.getElementById('totalCount').textContent = usageStats.total;
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  }

  bindEvents() {
    // 打开目标网站按钮
    document.getElementById('openTargetSite').addEventListener('click', () => {
      chrome.tabs.create({ url: 'https://jimeng.jianying.com/ai-tool/home/' });
      window.close();
    });

    // 打开设置按钮
    document.getElementById('openSettings').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
      window.close();
    });

    // 快速预设按钮
    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyPreset(btn.dataset.preset);
      });
    });

    // 反馈建议链接
    document.getElementById('feedbackLink').addEventListener('click', (e) => {
      e.preventDefault();
      chrome.tabs.create({ url: 'mailto:feedback@example.com?subject=AI图片描述优化助手反馈' });
      window.close();
    });

    // 使用帮助链接
    document.getElementById('helpLink').addEventListener('click', (e) => {
      e.preventDefault();
      this.showHelp();
    });
  }

  async applyPreset(presetType) {
    try {
      // 获取当前活动标签页
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab || !tab.url || !tab.url.includes('jimeng.jianying.com')) {
        this.showNotification('请先打开剪映AI网站', 'warning');
        return;
      }

      // 根据预设类型设置相应的特征组合
      const presets = {
        cartoon: {
          style: 'cartoon',
          color: 'bright',
          composition: 'center'
        },
        realistic: {
          style: 'realistic',
          color: 'natural',
          lighting: 'natural'
        },
        anime: {
          style: 'anime',
          character: 'anime_char',
          color: 'bright'
        },
        oil_painting: {
          style: 'oil_painting',
          color: 'warm',
          lighting: 'soft'
        }
      };

      const preset = presets[presetType];
      if (preset) {
        // 保存预设到用户偏好
        await chrome.storage.local.set({ userPreferences: preset });
        this.showNotification('预设已应用，请刷新页面查看效果', 'success');
        
        // 可选：自动刷新当前标签页
        chrome.tabs.reload(tab.id);
      }
    } catch (error) {
      console.error('应用预设失败:', error);
      this.showNotification('应用预设失败', 'error');
    }
  }

  showHelp() {
    const helpContent = `
      <div style="padding: 20px; font-family: system-ui;">
        <h3 style="color: #667eea; margin-bottom: 16px;">📖 使用帮助</h3>
        <div style="line-height: 1.6; color: #2c3e50;">
          <h4>🚀 快速开始</h4>
          <ol style="margin: 8px 0 16px 0; padding-left: 20px;">
            <li>点击"打开剪映AI"按钮访问目标网站</li>
            <li>插件会自动在输入框下方显示优化面板</li>
            <li>选择您想要的图片特征（风格、色彩等）</li>
            <li>输入初始描述或留空让AI生成</li>
            <li>点击"优化描述"按钮</li>
            <li>查看优化结果并应用到输入框</li>
          </ol>
          
          <h4>⚙️ AI模型配置</h4>
          <p style="margin: 8px 0;">支持多种AI模型：</p>
          <ul style="margin: 8px 0 16px 0; padding-left: 20px;">
            <li><strong>本地模型 (Ollama)</strong>：免费，需要本地安装</li>
            <li><strong>ChatGPT</strong>：需要API密钥</li>
            <li><strong>Claude</strong>：需要API密钥</li>
            <li><strong>Gemini</strong>：需要API密钥</li>
          </ul>
          
          <h4>🎨 快速预设</h4>
          <p style="margin: 8px 0;">使用预设可以快速设置常用的风格组合，提高工作效率。</p>
          
          <h4>💡 使用技巧</h4>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>原始描述越详细，优化效果越好</li>
            <li>可以多选特征进行组合</li>
            <li>优化后的描述可以进一步手动调整</li>
            <li>使用快速预设可以节省时间</li>
          </ul>
        </div>
      </div>
    `;

    // 创建新的帮助页面
    const helpUrl = 'data:text/html;charset=utf-8,' + encodeURIComponent(helpContent);
    chrome.tabs.create({ url: helpUrl });
    window.close();
  }

  showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span class="notification-icon">
        ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}
      </span>
      <span class="notification-text">${message}</span>
    `;

    // 添加样式
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#d4edda' : type === 'warning' ? '#fff3cd' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
      color: ${type === 'success' ? '#155724' : type === 'warning' ? '#856404' : type === 'error' ? '#721c24' : '#0c5460'};
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid ${type === 'success' ? '#c3e6cb' : type === 'warning' ? '#ffeaa7' : type === 'error' ? '#f5c6cb' : '#bee5eb'};
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-width: 300px;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // 3秒后自动移除
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  getStorageData(keys) {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, resolve);
    });
  }
}

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
document.head.appendChild(style);

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});