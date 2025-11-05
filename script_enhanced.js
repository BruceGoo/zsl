// ====== 赵露思穿搭合集 - 移动端增强版 ======

// 全局状态
let currentEpisode = 1;
let outfitsData = null;
let filteredOutfits = null;
let currentShareOutfit = null;

// ====== 页面初始化 ======
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initEventListeners();
});

// ====== 初始化事件监听 ======
function initEventListeners() {
    // 展开/收起更多集数
    const toggleMoreBtn = document.getElementById('toggle-more');
    const moreContainer = document.getElementById('more-episodes');

    if (toggleMoreBtn && moreContainer) {
        toggleMoreBtn.addEventListener('click', () => {
            const open = moreContainer.classList.toggle('open');
            toggleMoreBtn.textContent = open ? '收起更多集数' : '展开更多集数';
        });
    }

    // 触摸优化
    initTouchOptimizations();
}

// ====== 触摸优化 ======
function initTouchOptimizations() {
    // 防止双击缩放
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);

    // 优化滚动性能
    let ticking = false;
    function updateScrollIndicator() {
        const scrollY = window.scrollY;
        const fab = document.querySelector('.fab');
        if (fab) {
            if (scrollY > 300) {
                fab.style.opacity = '1';
                fab.style.visibility = 'visible';
            } else {
                fab.style.opacity = '0';
                fab.style.visibility = 'hidden';
            }
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateScrollIndicator);
            ticking = true;
        }
    });
}

// ====== 加载JSON数据 ======
async function loadData() {
    try {
        showLoading();
        const response = await fetch('outfits.json');
        outfitsData = await response.json();
        filteredOutfits = JSON.parse(JSON.stringify(outfitsData));
        hideLoading();
        initPage();
    } catch (error) {
        console.error('数据加载失败:', error);
        showError('数据加载失败，请刷新页面重试');
    }
}

// ====== 初始化页面 ======
function initPage() {
    initNavTabs();
    initSearch();
    initFilters();
    renderOutfits(1);
    initScrollToTop();
    initShareMenu();
}

// ====== 初始化导航标签 ======
function initNavTabs() {
    const primaryContainer = document.getElementById('primary-episodes');
    const moreContainer = document.getElementById('more-episodes');
    if (!primaryContainer || !moreContainer || !outfitsData) return;

    primaryContainer.innerHTML = '';
    moreContainer.innerHTML = '';

    outfitsData.episodes.forEach((ep, index) => {
        const button = document.createElement('button');
        button.className = 'tab-btn';
        button.dataset.episode = ep.episode;
        button.textContent = `第${ep.episode}集`;

        if (index === 0) {
            button.classList.add('active');
            currentEpisode = ep.episode;
        }

        button.addEventListener('click', () => onEpisodeClick(button, ep.episode));
        ep.episode <= 8 ? primaryContainer.appendChild(button) : moreContainer.appendChild(button);
    });
}

// ====== 初始化搜索功能 ======
function initSearch() {
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.innerHTML = `
        <div class="container">
            <div class="search-input-wrapper">
                <input type="text"
                       id="search-input"
                       placeholder="🔍 搜索品牌、款式、颜色..."
                       class="search-input">
                <span class="search-icon">🔍</span>
            </div>
            <div class="search-results-count" id="search-count"></div>
        </div>
    `;

    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(searchContainer, mainContent.firstChild);

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(handleSearch, 300));
}

// ====== 搜索处理 ======
function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();

    if (!query) {
        filteredOutfits = JSON.parse(JSON.stringify(outfitsData));
        renderOutfits(currentEpisode);
        updateSearchCount(0, outfitsData.metadata.total_outfits);
        return;
    }

    const results = searchOutfits(query);
    renderSearchResults(results);
    updateSearchCount(results.length, outfitsData.metadata.total_outfits);
}

// ====== 搜索穿搭 ======
function searchOutfits(query) {
    const results = [];

    outfitsData.episodes.forEach(ep => {
        ep.outfits.forEach(outfit => {
            let matched = false;

            if (outfit.title.toLowerCase().includes(query)) {
                matched = true;
            }

            if (!matched) {
                outfit.items.forEach(item => {
                    if (item.brand.toLowerCase().includes(query) ||
                        item.name.toLowerCase().includes(query) ||
                        item.price.toLowerCase().includes(query)) {
                        matched = true;
                    }
                });
            }

            if (matched) {
                results.push(outfit);
            }
        });
    });

    return results;
}

// ====== 渲染搜索结果 ======
function renderSearchResults(results) {
    const container = document.getElementById('outfit-container');
    if (results.length === 0) {
        container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <p>没有找到相关穿搭</p>
                <p>试试其他关键词吧 ✨</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    results.forEach(outfit => {
        const card = createOutfitCard(outfit);
        container.appendChild(card);
    });
}

// ====== 更新搜索计数 ======
function updateSearchCount(found, total) {
    const countElement = document.getElementById('search-count');
    if (!countElement) return;

    if (found === 0) {
        countElement.textContent = '';
    } else {
        countElement.textContent = `找到 ${found} 套相关穿搭`;
    }
}

// ====== 初始化筛选功能 ======
function initFilters() {
    const filtersContainer = document.createElement('div');
    filtersContainer.className = 'filters-container';
    filtersContainer.innerHTML = `
        <div class="container">
            <div class="filter-group">
                <label>价格筛选：</label>
                <select id="price-filter" class="filter-select">
                    <option value="">全部价格</option>
                    <option value="0-500">¥0 - ¥500</option>
                    <option value="500-1000">¥500 - ¥1,000</option>
                    <option value="1000-5000">¥1,000 - ¥5,000</option>
                    <option value="5000-999999">¥5,000 以上</option>
                </select>

                <label>品牌筛选：</label>
                <input type="text"
                       id="brand-filter"
                       placeholder="输入品牌名..."
                       class="brand-filter-input">
                <button id="clear-filters" class="clear-filters-btn">清除筛选</button>
            </div>
        </div>
    `;

    const mainContent = document.querySelector('.main-content');
    mainContent.insertBefore(filtersContainer, mainContent.children[1]);

    document.getElementById('price-filter').addEventListener('change', applyFilters);
    document.getElementById('brand-filter').addEventListener('input', debounce(applyFilters, 300));
    document.getElementById('clear-filters').addEventListener('click', clearFilters);
}

// ====== 应用筛选 ======
function applyFilters() {
    const priceFilter = document.getElementById('price-filter').value;
    const brandFilter = document.getElementById('brand-filter').value.trim().toLowerCase();

    let filtered = JSON.parse(JSON.stringify(outfitsData));

    filtered.episodes.forEach(ep => {
        ep.outfits = ep.outfits.filter(outfit => {
            let priceMatch = true;
            let brandMatch = true;

            if (priceFilter) {
                const [min, max] = priceFilter.split('-').map(Number);
                priceMatch = outfit.items.some(item => {
                    const price = parsePrice(item.price);
                    return price >= min && price < max;
                });
            }

            if (brandFilter) {
                brandMatch = outfit.items.some(item =>
                    item.brand.toLowerCase().includes(brandFilter)
                );
            }

            return priceMatch && brandMatch;
        });
    });

    filteredOutfits = filtered;
    renderOutfits(currentEpisode);
}

// ====== 清除筛选 ======
function clearFilters() {
    document.getElementById('price-filter').value = '';
    document.getElementById('brand-filter').value = '';
    filteredOutfits = JSON.parse(JSON.stringify(outfitsData));
    renderOutfits(currentEpisode);
}

// ====== 解析价格 ======
function parsePrice(priceStr) {
    const match = priceStr.match(/[\d,]+/);
    return match ? parseInt(match[0].replace(',', '')) : 0;
}

// ====== 处理集数点击 ======
function onEpisodeClick(button, episodeNum) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    currentEpisode = episodeNum;
    filteredOutfits = JSON.parse(JSON.stringify(outfitsData));
    document.getElementById('search-input').value = '';
    clearFilters();
    renderOutfits(episodeNum);
    smoothScrollToTop();
}

// ====== 渲染穿搭列表 ======
function renderOutfits(episode) {
    const container = document.getElementById('outfit-container');
    const episodeData = filteredOutfits.episodes.find(ep => ep.episode === episode);

    if (!episodeData || !episodeData.outfits || episodeData.outfits.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:50px;color:#999;">该集数暂无穿搭数据</p>';
        return;
    }

    container.style.opacity = '0';

    setTimeout(() => {
        container.innerHTML = '';
        episodeData.outfits.forEach(outfit => {
            const card = createOutfitCard(outfit);
            container.appendChild(card);
        });
        container.style.opacity = '1';
    }, 150);
}

// ====== 创建穿搭卡片（带微信分享） ======
function createOutfitCard(outfit) {
    const card = document.createElement('div');
    card.className = 'outfit-card';

    const itemsHTML = outfit.items.map(item => `
        <li class="item" onclick="copyItemInfo('${item.brand}', '${item.name}', '${item.price}', '${item.taobao_url}')"
            title="点击复制商品信息">
            <div class="item-content">
                <span class="item-brand">${item.brand}</span>
                <span class="item-name">${item.name}</span>
                <span class="item-price">${item.price}</span>
            </div>
            <span class="item-action">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                </svg>
            </span>
        </li>
    `).join('');

    card.innerHTML = `
        <button class="share-btn" onclick="openShareMenu('${encodeURIComponent(JSON.stringify(outfit))}')" title="分享到微信">
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.24c-.041.133-.048.269-.048.406 0 .163.071.319.199.431l1.578 1.364c.097.084.21.148.33.148.276 0 .5-.224.5-.5a.813.813 0 0 0-.119-.351l-.696-1.15 2.932-.815c.101-.028.182-.102.222-.203l1.467-3.655a.59.59 0 0 1-.103-.55 10.76 10.76 0 0 0-1.386-7.292C9.074 2.401 8.891 2.188 8.691 2.188zm-3.88 5.29c-.659 0-1.194-.535-1.194-1.194s.535-1.194 1.194-1.194 1.194.535 1.194 1.194-.535 1.194-1.194 1.194zm5.98 0c-.659 0-1.194-.535-1.194-1.194s.535-1.194 1.194-1.194 1.194.535 1.194 1.194-.535 1.194-1.194 1.194z"/>
            </svg>
        </button>
        <img src="${outfit.image}" alt="${outfit.title}" class="outfit-image"
             onclick="openImageModal('${outfit.image}', '${outfit.title}')"
             title="点击查看大图"
             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2220%22%3E图片加载失败%3C/text%3E%3C/svg%3E'">
        <div class="outfit-info">
            <h3 class="outfit-title">${outfit.title}</h3>
            <ul class="items-list">
                ${itemsHTML}
            </ul>
        </div>
    `;

    return card;
}

// ====== 初始化分享菜单 ======
function initShareMenu() {
    if (document.querySelector('.share-menu')) return;

    const shareMenu = document.createElement('div');
    shareMenu.className = 'share-menu';
    shareMenu.innerHTML = `
        <button class="share-menu-close" onclick="closeShareMenu()">×</button>
        <div class="share-menu-header">分享到</div>
        <div class="share-options">
            <div class="share-option" onclick="shareToWechat()">
                <div class="share-option-icon wechat">💬</div>
                <div class="share-option-label">微信好友</div>
            </div>
            <div class="share-option" onclick="shareToWeibo()">
                <div class="share-option-icon weibo">📱</div>
                <div class="share-option-label">微博</div>
            </div>
            <div class="share-option" onclick="shareToQQ()">
                <div class="share-option-icon qq">🐧</div>
                <div class="share-option-label">QQ</div>
            </div>
            <div class="share-option" onclick="copyShareLink()">
                <div class="share-option-icon link">🔗</div>
                <div class="share-option-label">复制链接</div>
            </div>
        </div>
    `;

    const backdrop = document.createElement('div');
    backdrop.className = 'share-backdrop';
    backdrop.onclick = closeShareMenu;

    document.body.appendChild(backdrop);
    document.body.appendChild(shareMenu);
}

// ====== 打开分享菜单 ======
function openShareMenu(outfitJson) {
    currentShareOutfit = JSON.parse(decodeURIComponent(outfitJson));

    const menu = document.querySelector('.share-menu');
    const backdrop = document.querySelector('.share-backdrop');

    menu.classList.add('show');
    backdrop.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// ====== 关闭分享菜单 ======
function closeShareMenu() {
    const menu = document.querySelector('.share-menu');
    const backdrop = document.querySelector('.share-backdrop');

    menu.classList.remove('show');
    backdrop.classList.remove('show');
    document.body.style.overflow = '';
    currentShareOutfit = null;
}

// ====== 分享到微信 ======
function shareToWechat() {
    if (!currentShareOutfit) return;

    // 使用微信原生分享（如果支持）
    if (navigator.share) {
        navigator.share({
            title: `【赵露思同款】${currentShareOutfit.title}`,
            text: '发现了一套超好看的穿搭！',
            url: window.location.href
        }).catch(err => console.log('分享失败:', err));
    } else {
        // 降级方案：复制分享文本
        const shareText = `我在看赵露思的穿搭：${currentShareOutfit.title}
${window.location.href}
快来看看吧 ✨`;

        copyToClipboard(shareText).then(() => {
            showCopyNotification('已复制分享内容', '请到微信粘贴分享');
        });
    }
    closeShareMenu();
}

// ====== 分享到微博 ======
function shareToWeibo() {
    if (!currentShareOutfit) return;

    const shareText = encodeURIComponent(`我在看赵露思在《许我耀眼》中的穿搭：${currentShareOutfit.title}，好漂亮呀！✨ ${window.location.href}`);
    const weiboUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(window.location.href)}&title=${shareText}`;
    window.open(weiboUrl, '_blank', 'width=600,height=400');
    closeShareMenu();
}

// ====== 分享到QQ ======
function shareToQQ() {
    if (!currentShareOutfit) return;

    const shareText = encodeURIComponent(`我在看赵露思在《许我耀眼》中的穿搭：${currentShareOutfit.title}，好漂亮呀！`);
    const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(window.location.href)}&title=${shareText}&pics=${currentShareOutfit.image}`;
    window.open(qqUrl, '_blank', 'width=600,height=400');
    closeShareMenu();
}

// ====== 复制分享链接 ======
function copyShareLink() {
    const shareText = `${window.location.href}\n赵露思穿搭合集，许我耀眼精美穿搭！✨`;
    copyToClipboard(shareText).then(() => {
        showCopyNotification('链接已复制', '可以分享给朋友啦！');
    });
    closeShareMenu();
}

// ====== 复制到剪切板 ======
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return Promise.resolve();
    } catch (err) {
        // 降级方案
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            document.execCommand('copy');
            return Promise.resolve();
        } catch (err) {
            return Promise.reject(err);
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

// ====== 复制商品信息 ======
async function copyItemInfo(brand, name, price, taobaoUrl) {
    const text = `【赵露思同款】
品牌：${brand}
商品：${name}
价格：${price}
购买链接：${taobaoUrl}
复制链接 → 打开手机淘宝`;

    try {
        await copyToClipboard(text);
        showCopyNotification(brand, name, taobaoUrl);
    } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    }
}

// ====== 显示复制成功提示 ======
function showCopyNotification(brand, name, taobaoUrl) {
    const existing = document.querySelector('.copy-notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = 'copy-notification show';
    notification.innerHTML = `
        <div style="font-size: 1.5rem; margin-bottom: 8px;">✨</div>
        <div>已复制: ${brand} ${name}</div>
        <div style="font-size: 0.9rem; margin-top: 8px; opacity: 0.9;">
            正在跳转到淘宝...
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);

    setTimeout(() => {
        window.open(taobaoUrl, '_blank');
    }, 1500);
}

// ====== 图片放大预览 ======
function openImageModal(imageSrc, title) {
    const modal = document.createElement('div');
    modal.className = 'image-modal active';
    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeImageModal()"></div>
        <div class="modal-content">
            <button class="modal-close" onclick="closeImageModal()" title="关闭（ESC）">×</button>
            <img src="${imageSrc}" alt="${title}" class="modal-image">
            <p class="modal-title">${title}</p>
        </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeImageModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}

function closeImageModal() {
    const modal = document.querySelector('.image-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            document.body.style.overflow = '';
        }, 300);
    }
}

// ====== 平滑滚动 ======
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ====== 初始化返回顶部按钮 ======
function initScrollToTop() {
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '↑';
    fab.title = '返回顶部';
    fab.onclick = smoothScrollToTop;
    document.body.appendChild(fab);
}

// ====== 显示/隐藏加载状态 ======
function showLoading() {
    const container = document.getElementById('outfit-container');
    if (container) {
        container.innerHTML = '<div class="loading">加载中...</div>';
    }
}

function showError(message) {
    const container = document.getElementById('outfit-container');
    if (container) {
        container.innerHTML = `<div style="text-align:center;padding:50px;color:#999;">
            <p>${message}</p>
        </div>`;
    }
}

// ====== 防抖函数 ======
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 导出全局函数
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.copyItemInfo = copyItemInfo;
window.openShareMenu = openShareMenu;
window.closeShareMenu = closeShareMenu;
window.shareToWechat = shareToWechat;
window.shareToWeibo = shareToWeibo;
window.shareToQQ = shareToQQ;
window.copyShareLink = copyShareLink;
