import streamlit as st
from get_pic import get_picture


# 页面配置
st.set_page_config(
    page_title="AI风格转换器",
    page_icon="✨",
    layout="wide"
)

# 侧边栏配置
with st.sidebar:
    st.title("🎨 风格选择")
    st.markdown("---")
    
    # 风格选择（侧边栏形式）
    st.subheader("选择您喜欢的风格")
    
    style_options = {
        "油画风格": "🎨",
        "水彩风格": "🌊", 
        "赛博朋克": "⚡",
        "日系动漫": "🌸",
        "古典艺术": "🏛️",
        "科幻风格": "🌌",
        "黑白摄影": "📷",
        "印象派": "🌅"
    }
    
    selected_styles = []
    for style_name, emoji in style_options.items():
        if st.checkbox(f"{emoji} {style_name}", key=style_name):
            selected_styles.append(style_name)
    
    st.markdown("---")
    
    # 风格数量限制提示
    if len(selected_styles) > 5:
        st.error("最多选择5种风格")
        selected_styles = selected_styles[:5]
    
    st.info(f"已选择: {len(selected_styles)}/5 种风格")
    
    # 生成按钮
    if len(selected_styles) > 0:
        if st.button("🚀 开始生成", type="primary", use_container_width=True):
            st.session_state.generating = True
    else:
        st.warning("请至少选择一种风格")

# 主内容区域
st.title("✨ AI图片风格转换器")
st.markdown("---")

# 文件上传
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("📤 上传图片")
    uploaded_file = st.file_uploader(
        "选择图片文件",
        type=['png', 'jpg', 'jpeg', 'gif', 'bmp'],
        help="支持常见图片格式"
    )

with col2:
    if uploaded_file is not None:
        st.subheader("📊 图片信息")
        file_details = {
            "文件名": uploaded_file.name,
            "文件大小": f"{uploaded_file.size / 1024:.1f} KB",
            "文件类型": uploaded_file.type
        }
        for key, value in file_details.items():
            st.write(f"**{key}:** {value}")

# 显示上传的图片
if uploaded_file is not None:
    st.markdown("---")
    st.subheader("🖼️ 预览图片")
    st.image(uploaded_file, caption="您的图片", width=200)
    
    # 显示选择的风格
    if selected_styles:
        st.markdown("---")
        st.subheader("🎭 已选择的风格")
        
        cols = st.columns(len(selected_styles))
        for i, style in enumerate(selected_styles):
            with cols[i]:
                st.info(f"{style_options[style]} {style}")
        
        # 生成状态
        if 'generating' in st.session_state and st.session_state.generating:
            st.markdown("---")
            st.subheader("🔄 生成进度")
            
            progress_bar = st.progress(0)
            status_text = st.empty()
            
            # 模拟生成过程
            for i in range(101):
                progress_bar.progress(i)
                if i < 30:
                    status_text.text("正在分析图片...")
                elif i < 60:
                    status_text.text("正在应用风格...")
                elif i < 90:
                    status_text.text("正在优化细节...")
                else:
                    status_text.text("生成完成！")
                st.empty()
                if i == 100:
                    break
            
            st.success("✨ 所有风格图片生成完成！")
            st.session_state.generating = False

            # 显示生成的图片，每个风格对应一张图片
            st.markdown("---")
            st.subheader("📸 生成结果")
            
            # 获取生成的图片
            desps = [f"{style_options[style]} {style}" for style in selected_styles]
            imgs = get_picture(desps, test=True)
            
            # 为每个选择的风格显示对应的生成图片
            for i, (style, img) in enumerate(zip(selected_styles, imgs)):
                st.markdown(f"**{style_options[style]} {style}**")
                st.image(img, caption=f"{style_options[style]} {style}", width=400)
                if i < len(selected_styles) - 1:  # 不是最后一个风格时添加分隔线
                    st.markdown("---")
else:
    st.info("👆 请先上传一张图片开始使用") 