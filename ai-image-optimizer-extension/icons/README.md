# 图标文件说明

本插件需要以下尺寸的图标文件：

## 所需图标

- `icon16.png` - 16x16像素，工具栏显示
- `icon48.png` - 48x48像素，插件管理页面
- `icon128.png` - 128x128像素，Chrome Web Store

## 🎨 图标设计

我们已经为您准备了专业的图标设计，包含以下元素：
- **AI脑部图标**: 体现人工智能特性
- **图片优化流程**: 展示从普通图片到优化图片的过程
- **渐变背景**: 使用项目主色调(#667eea到#764ba2)
- **现代简洁**: 确保在各种尺寸下都清晰可见

## 🚀 快速生成图标

### 方法1: 使用HTML生成器（推荐）
1. 在浏览器中打开 `generate-icons.html`
2. 点击"生成图标"按钮
3. 右键保存生成的PNG文件到当前目录
4. 确保文件名为：`icon16.png`, `icon48.png`, `icon128.png`

### 方法2: 使用Python脚本
```bash
# 安装依赖
pip install cairosvg pillow

# 运行脚本
python generate_icons.py
```

### 方法3: 在线转换
1. 将 `icon.svg` 上传到在线SVG转PNG工具
2. 分别生成16x16、48x48、128x128尺寸
3. 下载并重命名文件

## 设计规范

### 主题色彩
- 主色：#667eea (蓝紫色)
- 辅色：#764ba2 (深紫色)
- 背景：白色或透明

### 设计元素
- 核心图标：AI优化流程
- 结合AI、图片、优化等元素
- 保持简洁现代的设计风格
- 确保在小尺寸下清晰可见

## 备用方案

如果生成工具无法使用，可以：

1. 使用在线图标生成器：
   - [Favicon Generator](https://www.favicon-generator.org/)
   - [IconGenerator](https://icongeneratorai.com/)

2. 使用免费图标库：
   - [Feather Icons](https://feathericons.com/)
   - [Heroicons](https://heroicons.com/)
   - [Tabler Icons](https://tabler-icons.io/)

## 📁 文件结构

生成完成后，icons目录应包含：
```
icons/
├── README.md              # 本说明文件
├── icon.svg               # SVG源文件
├── generate-icons.html    # HTML生成工具
├── generate_icons.py      # Python生成脚本
├── icon16.png            # 16x16 PNG图标
├── icon48.png            # 48x48 PNG图标
└── icon128.png           # 128x128 PNG图标
```

## 🔧 安装说明

1. 确保PNG文件已生成并放置在 `icons/` 目录下
2. 文件名必须与 `manifest.json` 中的配置一致
3. 在Chrome扩展管理页面重新加载扩展
4. 图标应该会立即显示在浏览器工具栏中

## 清理

生成图标后，可以删除以下临时文件：
- `generate-icons.html`
- `generate_icons.py`
- `icon.svg`

保留PNG文件供扩展使用。