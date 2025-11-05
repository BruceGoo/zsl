import json
import re

# 读取data.js
with open('data.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 初始化数据结构
data = {
    "metadata": {
        "title": "赵露思穿搭合集 - 许我耀眼",
        "total_episodes": 32,
        "total_outfits": 0,
        "version": "2.0",
        "updated": "2025-11-05"
    },
    "episodes": []
}

current_episode = None
current_outfits = []

# 逐行解析
for line in lines:
    line = line.strip()
    
    # 检测episode开始
    if 'episode' in line and ': [' in line:
        ep_match = re.search(r'episode(\d+):', line)
        if ep_match:
            ep_num = int(ep_match.group(1))
            # 保存上一集数据
            if current_episode is not None:
                data["episodes"].append({
                    "episode": current_episode,
                    "outfits": current_outfits
                })
            current_episode = ep_num
            current_outfits = []
    
    # 检测穿搭开始
    elif line.startswith('{') and 'id:' in line and 'title:' in line:
        outfit = {}
        
        # 提取id
        id_match = re.search(r'id:\s*(\d+)', line)
        if id_match:
            outfit['id'] = int(id_match.group(1))
        
        # 提取title
        title_match = re.search(r'title:\s*[\'"](.*?)[\'"]', line)
        if title_match:
            outfit['title'] = title_match.group(1)
        
        # 提取image
        image_match = re.search(r'image:\s*[\'"](.*?)[\'"]', line)
        if image_match:
            outfit['image'] = image_match.group(1)
        
        outfit['items'] = []
        current_outfits.append(outfit)
    
    # 检测items项
    elif 'brand:' in line and 'name:' in line and 'price:' in line:
        if current_outfits and 'items' in current_outfits[-1]:
            brand_match = re.search(r'brand:\s*[\'"](.*?)[\'"]', line)
            name_match = re.search(r'name:\s*[\'"](.*?)[\'"]', line)
            price_match = re.search(r'price:\s*[\'"](.*?)[\'"]', line)
            
            if brand_match and name_match and price_match:
                brand = brand_match.group(1)
                name = name_match.group(1)
                price = price_match.group(1)
                
                # 生成淘宝搜索URL
                search_keyword = f"{brand} {name}".replace(' ', '+')
                taobao_url = f"https://s.taobao.com/search?q={search_keyword}"
                
                current_outfits[-1]['items'].append({
                    "brand": brand,
                    "name": name,
                    "price": price,
                    "taobao_url": taobao_url
                })

# 保存最后一集
if current_episode is not None:
    data["episodes"].append({
        "episode": current_episode,
        "outfits": current_outfits
    })

# 计算总穿搭数
total = sum(len(ep['outfits']) for ep in data['episodes'])
data['metadata']['total_outfits'] = total

# 保存JSON
with open('outfits.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"JSON文件生成成功！")
print(f"总集数: {len(data['episodes'])}")
print(f"总穿搭数: {total}")
print(f"文件大小: {len(json.dumps(data, ensure_ascii=False))} 字节")
