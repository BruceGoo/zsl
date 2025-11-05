// 当前选中的集数
let currentEpisode = 1;

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    initNavTabs();
    renderOutfits(1);

    // 展开/收起更多集数
    const toggleMoreBtn = document.getElementById('toggle-more');
    const moreContainer = document.getElementById('more-episodes');
    if (toggleMoreBtn && moreContainer) {
        // 默认隐藏（确保首次加载正确）
        moreContainer.classList.remove('open');
        toggleMoreBtn.addEventListener('click', () => {
            const open = moreContainer.classList.toggle('open');
            toggleMoreBtn.textContent = open ? '收起更多集数' : '展开更多集数';
        });
    }
});

// 动态生成导航标签
function initNavTabs() {
    const primaryContainer = document.getElementById('primary-episodes');
    const moreContainer = document.getElementById('more-episodes');
    if (!primaryContainer || !moreContainer) return;

    const episodes = getAllEpisodes();

    // 清空
    primaryContainer.innerHTML = '';
    moreContainer.innerHTML = '';

    // 第一行显示 1-8 集，其余放入更多
    episodes.forEach((ep, index) => {
        const button = document.createElement('button');
        button.className = 'tab-btn';
        button.dataset.episode = ep.num;
        button.textContent = ep.label;

        if (index === 0) {
            button.classList.add('active');
            currentEpisode = ep.num;
        }

        button.addEventListener('click', () => onEpisodeClick(button, ep.num));

        if (ep.num <= 8) {
            primaryContainer.appendChild(button);
        } else {
            moreContainer.appendChild(button);
        }
    });
}

function onEpisodeClick(button, episodeNum) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    currentEpisode = episodeNum;
    renderOutfits(episodeNum);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 渲染穿搭列表
function renderOutfits(episode) {
    const container = document.getElementById('outfit-container');
    const episodeKey = `episode${episode}`;
    const data = outfitsData[episodeKey];
    
    if (!data) {
        container.innerHTML = '<p style="text-align:center;padding:50px;color:#999;">暂无该集数的穿搭数据</p>';
        return;
    }
    
    // 添加淡出效果
    container.style.opacity = '0';
    
    setTimeout(() => {
        container.innerHTML = '';
        
        if (data.length === 0) {
            container.innerHTML = '<p style="text-align:center;padding:50px;color:#999;">该集数暂无穿搭数据</p>';
        } else {
            data.forEach(outfit => {
                const card = createOutfitCard(outfit);
                container.appendChild(card);
            });
        }
        
        // 添加淡入效果
        container.style.opacity = '1';
    }, 150);
}

// 创建穿搭卡片
function createOutfitCard(outfit) {
    const card = document.createElement('div');
    card.className = 'outfit-card';
    
    const itemsHTML = outfit.items.map(item => {
        // 生成淘宝搜索关键词和链接
        const searchKeyword = `${item.brand} ${item.name}`;
        const taobaoUrl = `https://s.taobao.com/search?q=${encodeURIComponent(searchKeyword)}`;
        
        return `
            <li class="item" onclick="window.open('${taobaoUrl}', '_blank')" title="点击在淘宝搜索：${searchKeyword}">
                <div class="item-content">
                    <span class="item-brand">${item.brand}</span>
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">${item.price}</span>
                </div>
                <span class="item-action">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                        <path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3m-2 16H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7z"/>
                    </svg>
                </span>
            </li>
        `;
    }).join('');
    
    card.innerHTML = `
        <img src="${outfit.image}" alt="${outfit.title}" class="outfit-image" onclick="openImageModal('${outfit.image}', '${outfit.title}')" title="点击查看大图" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22400%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22400%22 height=%22400%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 fill=%22%23999%22 font-size=%2220%22%3E图片加载失败%3C/text%3E%3C/svg%3E'">
        <div class="outfit-info">
            <h3 class="outfit-title">${outfit.title}</h3>
            <ul class="items-list">
                ${itemsHTML}
            </ul>
        </div>
    `;
    
    return card;
}

// 图片放大预览功能
function openImageModal(imageSrc, title) {
    // 创建modal元素
    const modal = document.createElement('div');
    modal.className = 'image-modal';
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
    
    // 添加ESC键关闭功能
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeImageModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // 添加淡入动画
    setTimeout(() => modal.classList.add('active'), 10);
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

// 平滑滚动到顶部（切换集数时）
function smoothScrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 添加过渡动画样式
const style = document.createElement('style');
style.textContent = `
    #outfit-container {
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);

