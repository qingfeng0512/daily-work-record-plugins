#!/bin/bash

# GitHub 提交脚本
# 用法: bash SUBMIT_TO_GITHUB.sh

echo "🚀 开始提交项目到GitHub..."
echo ""

# 1. 检查是否在项目目录
if [ ! -f "manifest.json" ]; then
  echo "❌ 错误：请在项目根目录运行此脚本"
  exit 1
fi

# 2. 初始化Git
echo "📦 初始化Git仓库..."
git init

# 3. 添加远程仓库
echo "🔗 添加远程仓库..."
git remote add origin https://github.com/qingfeng0512/daily-work-record-plugins.git

# 4. 添加文件（自动排除development/目录）
echo "📄 添加文件..."
git add .

# 5. 检查状态
echo ""
echo "📊 检查Git状态："
git status --short

# 6. 提交
echo ""
echo "💾 提交项目..."
git commit -m "🎉 Initial commit: 日常待办管理器 v1.0.0

✨ Features:
- 📅 日历视图和智能配色
- ✅ 待办事项增删改查
- 🔍 全局搜索功能
- 🤖 AI智能总结
- 📡 动态模型列表加载（v1/models API）
- 🎨 现代化UI设计
- 💜 今天日期紫色边框高亮
- 📏 智能高度系统（≤10项展开）

🔧 Tech:
- 原生JavaScript (ES6+)
- Chrome Extension Manifest V3
- Service Worker后台脚本
- 硅基流动AI集成
- 模块化架构设计

🔐 Security:
- 私有化API Key配置
- 本地数据存储
- 无硬编码凭据
- 已修复AI调用bug

📦 Package:
- 8个核心代码文件
- 3个图标资源
- 完整的README和文档"

# 7. 创建主分支
echo ""
echo "🌿 创建主分支..."
git branch -M main

# 8. 推送到GitHub
echo ""
echo "☁️ 推送到GitHub..."
git push -u origin main

# 9. 创建版本标签
echo ""
echo "🏷️ 创建版本标签..."
git tag -a v1.0.0 -m "🎉 Release v1.0.0 - 日常待办管理器

首个版本发布，包含所有核心功能：
- 美观的日历视图
- 完整的待办管理
- AI智能总结
- 动态模型加载
- 全局搜索功能

🔗 下载: https://github.com/qingfeng0512/daily-work-record-plugins/archive/v1.0.0.zip"

git push origin v1.0.0

echo ""
echo "✅ 完成！项目已成功提交到GitHub"
echo ""
echo "📱 访问地址："
echo "  GitHub仓库: https://github.com/qingfeng0512/daily-work-record-plugins"
echo "  Release页面: https://github.com/qingfeng0512/daily-work-record-plugins/releases"
echo ""
echo "🎯 下一步建议："
echo "  1. 在GitHub上完善仓库描述和标签"
echo "  2. 准备提交到Chrome Web Store"
echo "  3. 在社交媒体分享项目"
echo ""
echo "🎉 项目发布成功！"
