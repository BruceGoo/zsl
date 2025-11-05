// ====== 赵露思穿搭合集 - 升级版交互脚本 ======

// 全局状态
let currentEpisode = 1;
let outfitsData = null;
let filteredOutfits = null;

// ====== 页面初始化 ======
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initEventListeners();
});

// ====== 加载JSON数据 ======
async function loadData() {
    try {
        showLoading();
        const response = await fetch('outfits.json');
        outfitsData = await response.json();
        filteredOutfits = JSON.parse(JSON.stringify(outfitsData)); // 深拷贝
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
        <div class="container" style="padding: 20px;">
            <input type="text"
                   id="search-input"
                   placeholder="🔍 搜索品牌、款式、颜色..."
                   class="search-input">
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
        updateSearchCount(0, outfitsData.total_outfits);
        return;
    }

    const results = searchOutfits(query);
    renderSearchResults(results);
    updateSearchCount(results.length, outfitsData.total_outfits);
}

// ====== 搜索穿搭 ======
function searchOutfits(query) {
    const results = [];

    outfitsData.episodes.forEach(ep => {
        ep.outfits.forEach(outfit => {
            let matched = false;

            // 搜索标题
            if (outfit.title.toLowerCase().includes(query)) {
                matched = true;
            }

            // 搜索商品
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
        <div class="container" style="padding: 20px;">
            <div class="filter-group">
                <label>价格筛选：</label>
                <select id="price-filter" class="filter-select">
                    <option value="">全部价格</option>
                    <option value="0-500">¥0 - ¥500</option>
                    <option value="500-1000">¥500 - ¥1,000</option>
                    <option value="1000-5000">¥1,000 - ¥5,000</option>
                    <option value="5000-999999">¥5,000 以上</option>
                </select>

                <label style="margin-left: 20px;">品牌筛选：</label>
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

            // 价格筛选
            if (priceFilter) {
                const [min, max] = priceFilter.split('-').map(Number);
                priceMatch = outfit.items.some(item => {
                    const price = parsePrice(item.price);
                    return price >= min && price < max;
                });
            }

            // 品牌筛选
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
    filteredOutfits = JSON.parse(JSON.stringify(outfitsData)); // 重置筛选
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

// ====== 创建穿搭卡片 ======
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

// ====== 复制商品信息到剪切板 ======
async function copyItemInfo(brand, name, price, taobaoUrl) {
    const text = `【赵露思同款】
品牌：${brand}
商品：${name}
价格：${price}
购买链接：${taobaoUrl}
复制链接 → 打开手机淘宝`;

    try {
        await navigator.clipboard.writeText(text);
        showCopyNotification(brand, name, taobaoUrl);
    } catch (err) {
        console.error('复制失败:', err);
        // 降级方案
        fallbackCopyText(text);
    }
}

// ====== 降级复制方案 ======
function fallbackCopyText(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        document.execCommand('copy');
        showCopyNotification('复制成功', '请切换到淘宝APP');
    } catch (err) {
        console.error('复制失败:', err);
        alert('复制失败，请手动复制');
    }

    document.body.removeChild(textArea);
}

// ====== 显示复制成功提示 ======
function showCopyNotification(brand, name, taobaoUrl) {
    // 移除已存在的提示
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

    // 延迟跳转到淘宝
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

    // ESC键关闭
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

// ====== 平滑滚动到顶部 ======
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

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            fab.style.opacity = '1';
            fab.style.visibility = 'visible';
        } else {
            fab.style.opacity = '0';
            fab.style.visibility = 'hidden';
        }
    });
}

// ====== 显示/隐藏加载状态 ======
function showLoading() {
    const container = document.getElementById('outfit-container');
    if (container) {
        container.innerHTML = '<div class="loading">加载中...</div>';
    }
}

function hideLoading() {
    // 加载完成后会自动渲染内容
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

// 导出全局函数（用于HTML调用）
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.copyItemInfo = copyItemInfo;
