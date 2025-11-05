# 📚 Git 使用指南 - 赵露思穿搭合集项目

> 本指南将帮助您将项目推送到远程Git仓库，并部署到GitHub Pages

---

## ✅ 当前Git状态

- **仓库状态**：已初始化并提交完成
- **提交数**：2个
- **当前分支**：master
- **工作目录**：干净（无未提交更改）

---

## 🚀 推送到GitHub

### 步骤1：创建GitHub仓库

1. 访问 [GitHub.com](https://github.com)
2. 点击右上角的 **"+"** 按钮
3. 选择 **"New repository"**
4. 填写仓库信息：
   - **仓库名**：`zhaolusi-outfits` 或您喜欢的名称
   - **描述**：`赵露思穿搭合集 - 许我耀眼 | 移动端自适应 | 微信分享`
   - **可见性**：Public（公开）或 Private（私有）
   - **❌ 不要勾选** "Add a README file"（我们已有）
   - **❌ 不要勾选** ".gitignore"（我们已有）
   - **❌ 不要勾选** "license"（暂不需要）
5. 点击 **"Create repository"**

### 步骤2：连接本地仓库到GitHub

复制GitHub显示的命令，通常是：

```bash
git remote add origin https://github.com/你的用户名/你的仓库名.git
git branch -M master
git push -u origin master
```

**⚠️ 注意**：将命令中的 `你的用户名` 和 `你的仓库名` 替换为实际值

### 步骤3：推送代码

执行以下命令：

```bash
# 添加远程仓库
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# 设置默认分支为master
git branch -M master

# 推送到GitHub
git push -u origin master
```

完成后，您的代码就上传到GitHub了！

---

## 🌐 部署到GitHub Pages

### 方法一：GitHub自动部署（推荐）

1. 进入GitHub仓库页面
2. 点击 **"Settings"** 选项卡
3. 在左侧菜单找到 **"Pages"**
4. 在 **"Source"** 部分：
   - 选择 **"Deploy from a branch"**
   - Branch选择 **"master"**
   - Folder选择 **"/ (root)"**
5. 点击 **"Save"**
6. 等待2-3分钟，页面会显示您的网站地址：
   - `https://你的用户名.github.io/仓库名/`

### 方法二：使用GitHub Actions（高级）

如果需要自定义构建流程，可以创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ master ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
```

---

## 📋 常用Git命令

### 查看仓库状态
```bash
git status
```

### 查看提交历史
```bash
git log --oneline
```

### 查看远程仓库
```bash
git remote -v
```

### 拉取最新代码
```bash
git pull origin master
```

### 推送代码
```bash
git push origin master
```

### 创建新分支
```bash
git checkout -b feature/new-feature
```

### 合并分支
```bash
git checkout master
git merge feature/new-feature
```

---

## 🔄 更新代码流程

1. **修改文件**
2. **查看状态**：`git status`
3. **添加更改**：`git add .`
4. **提交更改**：`git commit -m "feat: 描述您的更改"`
5. **推送代码**：`git push origin master`

---

## 🐛 解决常见问题

### 问题1：推送被拒绝
**错误**：`Updates were rejected because the remote contains work...`

**解决**：
```bash
git pull origin master --rebase
git push origin master
```

### 问题2：认证失败
**错误**：`Authentication failed`

**解决**：
- 使用GitHub CLI：`gh auth login`
- 或使用个人访问令牌（PAT）
- 或使用SSH密钥

### 问题3：文件过大
**错误**：`File exceeds GitHub's file size limit`

**解决**：
- 使用Git LFS：大文件跟踪
- 或压缩图片文件
- 或排除某些文件到 `.gitignore`

---

## 📦 项目文件结构

```
项目根目录/
├── 📄 index_mobile_enhanced.html    # 移动端增强版页面 ⭐
├── 🎨 style_mobile_enhanced.css     # 移动端样式 ⭐
├── ⚙️ script_enhanced.js            # 增强脚本（含分享）⭐
├── 🎨 style_v2.css                  # 基础样式
├── 🔍 search-filter-styles.css      # 搜索筛选样式
├── 📊 outfits.json                  # 数据文件
├── 🖼️ pic/                          # 图片素材（191张）
├── 📚 README.md                     # 项目说明 ⭐
├── 📋 移动端优化方案.md               # 详细文档 ⭐
├── 📖 使用说明.md                    # 使用指南 ⭐
├── 🚀 部署脚本.sh                    # 自动部署脚本
└── 📄 .gitignore                    # Git忽略文件
```

⭐ = 核心文件

---

## 🎯 GitHub Pages自定义域名

如果您有自己的域名：

1. 在仓库根目录创建 `CNAME` 文件
2. 文件内容：您的域名（如：`outfits.yourdomain.com`）
3. 在GitHub Pages设置中配置DNS记录：
   ```
   CNAME记录: yourdomain.com → username.github.io
   ```

---

## 📞 获取帮助

- **GitHub文档**：https://docs.github.com
- **Git教程**：https://git-scm.com/book
- **GitHub Pages指南**：https://pages.github.com

---

## 🎉 完成后

恭喜！您现在可以：

1. ✅ 访问您的GitHub仓库
2. ✅ 分享代码给其他人
3. ✅ 访问您的网站：https://用户名.github.io/仓库名/
4. ✅ 持续更新和优化项目

---

**🚀 立即开始**：创建您的GitHub仓库并推送代码！

---

*生成时间：2025年11月5日*
*Git版本管理：v2.1 Mobile Enhanced*
