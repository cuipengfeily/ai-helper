#!/usr/bin/env python3
"""
AI图片描述优化助手 - 图标生成器
将SVG图标转换为浏览器扩展所需的PNG格式

使用前请安装依赖：
pip install cairosvg pillow

使用方法：
python generate_icons.py
"""

import os
from pathlib import Path

def generate_png_icons():
    """生成PNG图标文件"""
    try:
        import cairosvg
        from PIL import Image
        import io
        
        # SVG内容
        svg_content = '''
<svg width="128" height="128" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>
  
  <!-- 背景圆形 -->
  <circle cx="64" cy="64" r="56" fill="url(#gradient)" filter="url(#shadow)"/>
  
  <!-- AI脑部图标 -->
  <g transform="translate(35, 25)">
    <!-- 脑部轮廓 -->
    <path d="M20 15 C30 10, 45 10, 50 20 C55 25, 55 35, 50 40 C45 45, 30 45, 20 40 C15 35, 15 25, 20 15 Z" 
          fill="white" opacity="0.9"/>
    <!-- 神经网络线条 -->
    <line x1="25" y1="20" x2="35" y2="25" stroke="#667eea" stroke-width="2" opacity="0.8"/>
    <line x1="30" y1="25" x2="40" y2="30" stroke="#667eea" stroke-width="2" opacity="0.8"/>
    <line x1="25" y1="30" x2="35" y2="35" stroke="#667eea" stroke-width="2" opacity="0.8"/>
    <!-- 节点 -->
    <circle cx="25" cy="20" r="2" fill="#764ba2"/>
    <circle cx="35" cy="25" r="2" fill="#764ba2"/>
    <circle cx="30" cy="25" r="2" fill="#764ba2"/>
    <circle cx="40" cy="30" r="2" fill="#764ba2"/>
    <circle cx="25" cy="30" r="2" fill="#764ba2"/>
    <circle cx="35" cy="35" r="2" fill="#764ba2"/>
  </g>
  
  <!-- 图片框架图标 -->
  <g transform="translate(20, 55)">
    <rect x="0" y="0" width="35" height="25" rx="3" fill="white" opacity="0.9"/>
    <rect x="3" y="3" width="29" height="19" rx="2" fill="#f0f8ff"/>
    <!-- 山形图标表示图片 -->
    <polygon points="8,18 15,10 22,15 30,8 30,19 8,19" fill="#667eea" opacity="0.7"/>
    <circle cx="12" cy="8" r="2" fill="#764ba2" opacity="0.7"/>
  </g>
  
  <!-- 优化箭头 -->
  <g transform="translate(55, 60)">
    <path d="M0 8 L12 8 L8 4 M12 8 L8 12" stroke="white" stroke-width="3" fill="none" stroke-linecap="round"/>
  </g>
  
  <!-- 优化后的图片 -->
  <g transform="translate(73, 55)">
    <rect x="0" y="0" width="35" height="25" rx="3" fill="white" opacity="0.95"/>
    <rect x="3" y="3" width="29" height="19" rx="2" fill="#f0f8ff"/>
    <!-- 更清晰的山形图标 -->
    <polygon points="8,18 15,8 22,12 30,6 30,19 8,19" fill="#667eea"/>
    <circle cx="12" cy="8" r="2" fill="#764ba2"/>
    <!-- 质量提升星标 -->
    <polygon points="26,6 27,8 29,8 27.5,9.5 28,12 26,10.5 24,12 24.5,9.5 23,8 25,8" fill="#ffd700"/>
  </g>
  
  <!-- 底部文字提示 -->
  <text x="64" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="white" opacity="0.8">AI优化</text>
</svg>
        '''
        
        # 需要生成的图标尺寸
        sizes = [16, 48, 128]
        
        for size in sizes:
            print(f"正在生成 {size}x{size} 图标...")
            
            # 转换为PNG
            png_data = cairosvg.svg2png(
                bytestring=svg_content.encode('utf-8'),
                output_width=size,
                output_height=size
            )
            
            # 保存文件
            filename = f"icon{size}.png"
            with open(filename, 'wb') as f:
                f.write(png_data)
            
            print(f"✅ 已生成: {filename}")
        
        print("\n🎉 所有图标生成完成！")
        print("请将生成的PNG文件放在ai-image-optimizer-extension/icons/目录下")
        
    except ImportError as e:
        print("❌ 缺少必要的Python库，请先安装：")
        print("pip install cairosvg pillow")
        print(f"错误详情: {e}")
    except Exception as e:
        print(f"❌ 生成图标时出错: {e}")

def create_simple_fallback_icons():
    """创建简单的备用图标（如果无法使用复杂SVG）"""
    try:
        from PIL import Image, ImageDraw, ImageFont
        
        sizes = [16, 48, 128]
        
        for size in sizes:
            # 创建图像
            img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
            draw = ImageDraw.Draw(img)
            
            # 绘制渐变背景圆形
            draw.ellipse([2, 2, size-2, size-2], fill=(102, 126, 234))
            
            # 添加简单的AI标志
            if size >= 48:
                # 大图标添加文字
                try:
                    font_size = max(8, size // 8)
                    font = ImageFont.load_default()
                    text = "AI"
                    bbox = draw.textbbox((0, 0), text, font=font)
                    text_width = bbox[2] - bbox[0]
                    text_height = bbox[3] - bbox[1]
                    x = (size - text_width) // 2
                    y = (size - text_height) // 2
                    draw.text((x, y), text, fill='white', font=font)
                except:
                    # 如果字体不可用，绘制简单图形
                    draw.rectangle([size//4, size//4, 3*size//4, 3*size//4], fill='white')
            else:
                # 小图标只绘制简单点
                center = size // 2
                draw.ellipse([center-2, center-2, center+2, center+2], fill='white')
            
            # 保存
            filename = f"icon{size}.png"
            img.save(filename, 'PNG')
            print(f"✅ 已生成简单图标: {filename}")
        
        print("\n🎉 简单图标生成完成！")
        
    except ImportError:
        print("❌ 无法创建图标，缺少PIL库。请安装：pip install pillow")
    except Exception as e:
        print(f"❌ 创建简单图标时出错: {e}")

if __name__ == "__main__":
    print("🎨 AI图片描述优化助手 - 图标生成器")
    print("=" * 50)
    
    # 首先尝试生成完整的SVG图标
    print("方法1: 尝试生成高质量SVG图标...")
    generate_png_icons()
    
    # 检查是否成功生成
    if not all(os.path.exists(f"icon{size}.png") for size in [16, 48, 128]):
        print("\n方法2: 生成简单备用图标...")
        create_simple_fallback_icons()
    
    print("\n📝 使用说明：")
    print("1. 将生成的PNG文件复制到 ai-image-optimizer-extension/icons/ 目录")
    print("2. 确保文件名为: icon16.png, icon48.png, icon128.png")
    print("3. 在Chrome中重新加载扩展")
    print("4. 完成后可以删除这个Python脚本")