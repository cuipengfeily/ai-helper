# AI图片描述优化助手

一个专为剪映AI图片生成网站设计的浏览器插件，通过AI技术智能优化您的图片描述，提升图片生成质量。

![插件预览](preview.png)

## ✨ 核心功能

- 🎨 **多维度特征选择**: 图片风格、人物特征、色彩风格、构图方式、场景设定、光影效果
- 🤖 **多AI模型支持**: ChatGPT、Claude、Gemini、本地Ollama模型
- 📝 **智能描述优化**: 基于原始描述+特征选择生成优化后的描述
- 🚀 **快速预设**: 一键应用常用风格组合
- 💾 **用户偏好记忆**: 自动保存您的选择偏好
- 🔒 **隐私安全**: API密钥本地存储，数据不上传

## 🎯 支持网站

- [剪映AI图片生成](https://jimeng.jianying.com/ai-tool/home/)

## 🚀 安装指南

### 方法1: Chrome Web Store（推荐）
> 插件正在审核中，暂时请使用手动安装

### 方法2: 手动安装
1. 下载本项目代码
2. 打开Chrome浏览器，进入 `chrome://extensions/`
3. 开启右上角的"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `ai-image-optimizer-extension` 文件夹
6. 安装完成！

## 🔧 配置指南

### 本地模型配置（推荐，免费）
1. 安装 [Ollama](https://ollama.ai/)
2. 下载模型：`ollama pull llama2`
3. 启动服务：`ollama serve`
4. 在插件设置中选择"本地模型"即可使用

### 云端模型配置
如需使用云端AI模型，请获取相应的API密钥：

- **OpenAI**: [获取API Key](https://platform.openai.com/api-keys)
- **Claude**: [获取API Key](https://console.anthropic.com/)
- **Gemini**: [获取API Key](https://makersuite.google.com/app/apikey)

## 📖 使用教程

### 基础使用
1. 访问 [剪映AI图片生成网站](https://jimeng.jianying.com/ai-tool/home/)
2. 插件会自动在输入框下方显示优化面板
3. 选择您想要的图片特征
4. 输入初始描述（可选）
5. 点击"🚀 优化描述"按钮
6. 查看优化结果，点击"📤 应用"使用

### 高级技巧
- **组合特征**: 同时选择多个特征可获得更精准的描述
- **快速预设**: 使用Popup中的预设快速设置常用风格
- **历史记录**: 在设置中开启历史保存功能
- **批量处理**: 通过导入导出功能管理配置

## 🎨 功能详解

### 特征选择系统
| 特征类别 | 说明 | 示例选项 |
|---------|------|---------|
| 🎨 图片风格 | 整体艺术风格 | 卡通、写实、油画、水彩、素描 |
| 🎭 人物特征 | 人物类型设定 | 现代人物、古装、动漫角色、奇幻 |
| 🌈 色彩风格 | 色调和配色 | 明亮、暗调、黑白、复古、霓虹 |
| 📐 构图方式 | 画面构图法则 | 居中、三分法、对称、动态 |
| 🌍 场景设定 | 环境背景 | 室内、户外、城市、自然、太空 |
| 💡 光影效果 | 光线和阴影 | 自然光、人工光、逆光、侧光 |

### AI模型对比
| 模型 | 费用 | 速度 | 质量 | 隐私 | 推荐度 |
|------|------|------|------|------|--------|
| Ollama (本地) | 免费 | 中等 | 良好 | 最高 | ⭐⭐⭐⭐⭐ |
| ChatGPT | 付费 | 快速 | 优秀 | 一般 | ⭐⭐⭐⭐ |
| Claude | 付费 | 快速 | 优秀 | 一般 | ⭐⭐⭐⭐ |
| Gemini | 免费额度 | 快速 | 良好 | 一般 | ⭐⭐⭐ |

## 🛠️ 开发指南

### 项目结构
```
ai-image-optimizer-extension/
├── manifest.json          # 插件配置文件
├── content/               # 内容脚本
│   ├── content.js         # 主要功能逻辑
│   └── content.css        # 样式文件
├── background/            # 后台脚本
│   └── background.js      # API调用处理
├── popup/                 # 弹出窗口
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/               # 设置页面
│   ├── options.html
│   ├── options.js
│   └── options.css
├── config/                # 配置文件
│   └── config.json        # 特征配置
├── icons/                 # 图标文件
└── README.md
```

### 自定义配置
可以通过修改 `config/config.json` 来自定义特征选项：

```json
{
  "categories": [
    {
      "key": "style",
      "name": "图片风格",
      "icon": "🎨",
      "options": [
        {
          "value": "custom",
          "label": "自定义风格",
          "prompt": "custom art style"
        }
      ]
    }
  ]
}
```

## 🐛 问题排查

### 常见问题

**Q: 插件无法检测到输入框？**
A: 请确保已访问正确的网站地址，刷新页面后重试。

**Q: 本地模型连接失败？**
A: 确保Ollama服务正在运行：`ollama serve`

**Q: API调用失败？**
A: 检查API密钥是否正确，网络连接是否正常。

**Q: 优化结果不理想？**
A: 尝试提供更详细的原始描述，或调整特征选择组合。

### 日志查看
按F12打开开发者工具，在Console选项卡中查看详细错误信息。

## 🔄 更新日志

### v1.0.0 (2024-01-XX)
- ✨ 首版发布
- 🎨 支持6大特征类别选择
- 🤖 支持4种AI模型
- 💾 用户偏好保存
- 🚀 快速预设功能

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork本项目
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送分支：`git push origin feature/AmazingFeature`
5. 提交Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 💬 联系方式

- **问题反馈**: [GitHub Issues](https://github.com/your-username/ai-image-optimizer/issues)
- **功能建议**: [GitHub Discussions](https://github.com/your-username/ai-image-optimizer/discussions)
- **邮箱**: your-email@example.com

---

⭐ 如果这个项目对您有帮助，请给我们一个Star！

![Star History](https://api.star-history.com/svg?repos=your-username/ai-image-optimizer&type=Date)