// AI图片描述优化助手 - 简化版本
console.log('简化版本内容脚本已加载');

class AIImageOptimizerSimple {
  constructor() {
    this.init();
  }

  async init() {
    console.log('开始初始化简化版本...');
    
    // 等待页面加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createSimpleUI());
    } else {
      setTimeout(() => this.createSimpleUI(), 1000);
    }
  }

  createSimpleUI() {
    try {
      console.log('创建简化UI...');
      
      // 检查是否已经存在
      if (document.getElementById('ai-image-optimizer-simple')) {
        console.log('简化UI已存在');
        return;
      }

      // 创建简单的UI
      const simpleContainer = document.createElement('div');
      simpleContainer.id = 'ai-image-optimizer-simple';
      simpleContainer.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 400px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 16px;
        color: white;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        font-family: Arial, sans-serif;
      `;

      simpleContainer.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
          <h3 style="margin: 0; font-size: 16px;">📊 图片描述优化助手</h3>
          <div>
            <button id="simpleSettings" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 8px;">
              🔧 设置
            </button>
            <button id="simpleClose" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
              ✕
            </button>
          </div>
        </div>
        
        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 12px;">
          <p style="margin: 0; font-size: 14px;">这是一个简化版本的插件界面，用于测试设置按钮功能。</p>
        </div>
        
        <div style="text-align: center;">
          <button id="simpleTest" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin: 0 4px;">
            🧪 测试按钮
          </button>
          <button id="simpleReload" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 16px; border-radius: 6px; cursor: pointer; margin: 0 4px;">
            🔄 重新加载
          </button>
        </div>
        
        <div id="simpleStatus" style="font-size: 12px; opacity: 0.8; margin-top: 12px; text-align: center;">
          状态: 已加载 | 时间: ${new Date().toLocaleTimeString()}
        </div>
      `;

      // 插入到页面
      document.body.appendChild(simpleContainer);
      console.log('简化UI已创建并插入到页面');

      // 绑定事件
      this.bindSimpleEvents(simpleContainer);

    } catch (error) {
      console.error('创建简化UI失败:', error);
    }
  }

  bindSimpleEvents(container) {
    try {
      console.log('开始绑定简化事件...');
      
      // 设置按钮
      const settingsBtn = container.querySelector('#simpleSettings');
      if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
          console.log('简化设置按钮被点击');
          this.openSettings();
        });
        console.log('简化设置按钮事件绑定成功');
      } else {
        console.error('找不到简化设置按钮');
      }

      // 测试按钮
      const testBtn = container.querySelector('#simpleTest');
      if (testBtn) {
        testBtn.addEventListener('click', () => {
          console.log('简化测试按钮被点击');
          this.showSimpleMessage('测试按钮正常工作！');
        });
        console.log('简化测试按钮事件绑定成功');
      }

      // 重新加载按钮
      const reloadBtn = container.querySelector('#simpleReload');
      if (reloadBtn) {
        reloadBtn.addEventListener('click', () => {
          console.log('简化重新加载按钮被点击');
          location.reload();
        });
        console.log('简化重新加载按钮事件绑定成功');
      }

      // 关闭按钮
      const closeBtn = container.querySelector('#simpleClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          console.log('简化关闭按钮被点击');
          container.remove();
        });
        console.log('简化关闭按钮事件绑定成功');
      }

      console.log('简化事件绑定完成');
    } catch (error) {
      console.error('绑定简化事件失败:', error);
    }
  }

  openSettings() {
    try {
      console.log('尝试打开设置页面...');
      chrome.runtime.sendMessage({ action: 'openOptions' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('打开设置页面失败:', chrome.runtime.lastError);
          this.showSimpleMessage('打开设置页面失败: ' + chrome.runtime.lastError.message);
        } else {
          console.log('设置页面打开成功');
          this.showSimpleMessage('设置页面已打开');
        }
      });
    } catch (error) {
      console.error('打开设置页面时出错:', error);
      this.showSimpleMessage('打开设置页面出错: ' + error.message);
    }
  }

  showSimpleMessage(message) {
    const statusEl = document.getElementById('simpleStatus');
    if (statusEl) {
      statusEl.innerHTML = `状态: ${message} | 时间: ${new Date().toLocaleTimeString()}`;
    }
    console.log('简化消息:', message);
  }
}

// 初始化简化版本
new AIImageOptimizerSimple(); 