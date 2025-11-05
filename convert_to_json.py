import json
import re

# 读取原始data.js文件
with open('data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 使用正则表达式提取outfitsData对象
pattern = r'const outfitsData = ({.*?});'
match = re.search(pattern, content, re.DOTALL)

if match:
    outfits_data = match.group(1)
    
    # 创建新的数据结构
    new_data = {
        "metadata": {
            "title": "赵露思穿搭合集 - 许我耀眼",
            "total_episodes": 32,
            "total_outfits": 0,
            "version": "2.0",
            "updated": "2025-11-05"
        },
        "episodes": []
    }
    
    # 解析每个episode
    episode_pattern = r'episode(\d+):\s*(\[.*?\])'
    episodes = re.findall(episode_pattern, outfits_data, re.DOTALL)
    
    total_outfits = 0
    
    for ep_num, ep_data in episodes:
        # 解析穿搭数组
        outfit_pattern = r'\{\s*id:\s*(\d+),\s*title:\s*[\'"](.*?)[\'"],\s*image:\s*[\'"](.*?)[\'"],\s*items:\s*\[(.*?)\]\s*\}'
        outfits = re.findall(outfit_pattern, ep_data, re.DOTALL)
        
        episode_outfits = []
        for outfit in outfits:
            outfit_id, title, image, items_str = outfit
            
            # 解析items数组
            item_pattern = r'\{\s*brand:\s*[\'"](.*?)[\'"],\s*name:\s*[\'"](.*?)[\'"],\s*price:\s*[\'"](.*?)[\'"]\s*\}'
            items = re.findall(item_pattern, items_str, re.DOTALL)
            
            processed_items = []
            for item in items:
                brand, name, price = item
                from urllib.parse import quote
                search_keyword = f'{brand} {name}'.replace(' ', '+')
                processed_items.append({
                    "brand": brand,
                    "name": name,
                    "price": price,
                    "taobao_url": f"https://s.taobao.com/search?q={search_keyword}"
                })
            
            episode_outfits.append({
                "id": int(outfit_id),
                "title": title,
                "image": image,
                "items": processed_items
            })
            total_outfits += 1
        
        new_data["episodes"].append({
            "episode": int(ep_num),
            "outfits": episode_outfits
        })
    
    new_data["metadata"]["total_outfits"] = total_outfits
    
    # 保存为JSON文件
    with open('outfits.json', 'w', encoding='utf-8') as f:
        json.dump(new_data, f, ensure_ascii=False, indent=2)
    
    print(f"Success!")
    print(f"Total episodes: {len(new_data['episodes'])}")
    print(f"Total outfits: {total_outfits}")
    print(f"Output file: outfits.json")
else:
    print("Failed!")
