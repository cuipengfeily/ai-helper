// AI图片描述优化助手 - 调试版本
console.log('调试版本内容脚本已加载');

class AIImageOptimizerDebug {
  constructor() {
    this.init();
  }

  async init() {
    console.log('开始初始化调试版本...');
    
    // 等待页面加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createDebugUI());
    } else {
      setTimeout(() => this.createDebugUI(), 1000);
    }
  }

  createDebugUI() {
    try {
      console.log('创建调试UI...');
      
      // 检查是否已经存在
      if (document.getElementById('ai-image-optimizer-debug')) {
        console.log('调试UI已存在');
        return;
      }

      // 创建简单的调试UI
      const debugContainer = document.createElement('div');
      debugContainer.id = 'ai-image-optimizer-debug';
      debugContainer.className = 'ai-optimizer-container';
      debugContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 300px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 16px;
        color: white;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      `;

      debugContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 16px;">🔧 调试面板</h3>
          <button id="debugClose" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 4px 8px; border-radius: 4px; cursor: pointer;">✕</button>
        </div>
        
        <div style="margin-bottom: 12px;">
          <button id="debugSettings" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; width: 100%; margin-bottom: 8px;">
            🔧 打开设置页面
          </button>
          
          <button id="debugTest" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; width: 100%; margin-bottom: 8px;">
            🧪 测试功能
          </button>
          
          <button id="debugReload" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; width: 100%;">
            🔄 重新加载
          </button>
        </div>
        
        <div id="debugInfo" style="font-size: 12px; opacity: 0.8;">
          状态: 已加载<br>
          时间: ${new Date().toLocaleTimeString()}
        </div>
      `;

      // 插入到页面
      document.body.appendChild(debugContainer);
      console.log('调试UI已创建并插入到页面');

      // 绑定事件
      this.bindDebugEvents(debugContainer);

    } catch (error) {
      console.error('创建调试UI失败:', error);
    }
  }

  bindDebugEvents(container) {
    try {
      // 设置按钮
      const settingsBtn = container.querySelector('#debugSettings');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
          console.log('调试设置按钮被点击');
          this.openSettings();
        });
        console.log('调试设置按钮事件绑定成功');
      } else {
        console.error('找不到调试设置按钮');
      }

      // 测试按钮
      const testBtn = container.querySelector('#debugTest');
      if (testBtn) {
        testBtn.addEventListener('click', () => {
          console.log('调试测试按钮被点击');
          this.showDebugMessage('测试功能正常工作！');
        });
        console.log('调试测试按钮事件绑定成功');
      }

      // 重新加载按钮
      const reloadBtn = container.querySelector('#debugReload');
      if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
          console.log('调试重新加载按钮被点击');
          location.reload();
        });
        console.log('调试重新加载按钮事件绑定成功');
      }

      // 关闭按钮
      const closeBtn = container.querySelector('#debugClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          console.log('调试关闭按钮被点击');
          container.remove();
        });
        console.log('调试关闭按钮事件绑定成功');
      }

      console.log('调试事件绑定完成');
    } catch (error) {
      console.error('绑定调试事件失败:', error);
    }
  }

  openSettings() {
    try {
      console.log('尝试打开设置页面...');
      chrome.runtime.sendMessage({ action: 'openOptions' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('打开设置页面失败:', chrome.runtime.lastError);
          this.showDebugMessage('打开设置页面失败: ' + chrome.runtime.lastError.message);
        } else {
          console.log('设置页面打开成功');
          this.showDebugMessage('设置页面已打开');
        }
      });
    } catch (error) {
      console.error('打开设置页面时出错:', error);
      this.showDebugMessage('打开设置页面出错: ' + error.message);
    }
  }

  showDebugMessage(message) {
    const infoEl = document.getElementById('debugInfo');
    if (infoEl) {
      infoEl.innerHTML = `状态: ${message}<br>时间: ${new Date().toLocaleTimeString()}`;
    }
    console.log('调试消息:', message);
  }
}

// 初始化调试版本
new AIImageOptimizerDebug(); 