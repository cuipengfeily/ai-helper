# 图标文件说明

本插件需要以下尺寸的图标文件：

## 所需图标

- `icon16.png` - 16x16像素，工具栏显示
- `icon48.png` - 48x48像素，插件管理页面
- `icon128.png` - 128x128像素，Chrome Web Store

## 设计要求

### 主题色彩
- 主色：#667eea (蓝紫色)
- 辅色：#764ba2 (深紫色)
- 背景：白色或透明

### 设计元素
- 核心图标：📊 (数据分析/优化图标)
- 可以结合AI、图片、优化等元素
- 保持简洁现代的设计风格
- 确保在小尺寸下清晰可见

## 临时解决方案

如果暂时没有专业图标，可以：

1. 使用在线图标生成器：
   - [Favicon Generator](https://www.favicon-generator.org/)
   - [IconGenerator](https://icongeneratorai.com/)

2. 使用Emoji转图片：
   - 将📊表情符号转换为不同尺寸的PNG图片

3. 使用免费图标库：
   - [Feather Icons](https://feathericons.com/)
   - [Heroicons](https://heroicons.com/)
   - [Tabler Icons](https://tabler-icons.io/)

## 快速获取图标

### 🚀 最简单方式（推荐）
1. 在浏览器中打开 `simple_icon_generator.html`
2. 点击"生成并下载所有图标"按钮
3. 将下载的3个PNG文件直接放在此目录下

### 🎨 高级自定义
1. 打开 `create_icons.html` 获得更精美的渐变图标
2. 或编辑 `icon.svg` 后使用在线工具转换为PNG

### 📋 免费图标资源
查看 `get_free_icons.md` 获取更多免费图标选择

## 安装说明

将图标文件放置在 `icons/` 目录下，确保文件名与 `manifest.json` 中的配置一致：
- `icon16.png` (16×16像素)
- `icon48.png` (48×48像素)  
- `icon128.png` (128×128像素)