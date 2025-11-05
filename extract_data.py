import json
import re

# 读取整个文件
with open('data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 提取outfitsData对象的内容
start = content.find('const outfitsData = {')
end = content.rfind('};')

if start != -1 and end != -1:
    data_section = content[start:end+2]
    
    # 使用正则表达式提取episode数据
    episode_blocks = re.findall(r'episode\d+:\s*\[(.*?)\];', data_section, re.DOTALL)
    
    episodes = []
    ep_num = 1
    
    for block in episode_blocks:
        outfits = []
        
        # 提取每个outfit
        outfit_matches = re.findall(r'\{\s*id:\s*(\d+),\s*title:\s*[\'"](.*?)[\'"],\s*image:\s*[\'"](.*?)[\'"],\s*items:\s*\[(.*?)\]\s*\}', block, re.DOTALL)
        
        for match in outfit_matches:
            outfit_id, title, image, items_block = match
            
            # 提取items
            item_matches = re.findall(r'\{\s*brand:\s*[\'"](.*?)[\'"],\s*name:\s*[\'"](.*?)[\'"],\s*price:\s*[\'"](.*?)[\'"]\s*\}', items_block)
            
            items = []
            for item in item_matches:
                brand, name, price = item
                search_keyword = f"{brand} {name}".replace(' ', '+')
                items.append({
                    "brand": brand,
                    "name": name,
                    "price": price,
                    "taobao_url": f"https://s.taobao.com/search?q={search_keyword}"
                })
            
            outfits.append({
                "id": int(outfit_id),
                "title": title,
                "image": image,
                "items": items
            })
        
        episodes.append({
            "episode": ep_num,
            "outfits": outfits
        })
        ep_num += 1
    
    # 构建最终JSON
    result = {
        "metadata": {
            "title": "赵露思穿搭合集 - 许我耀眼",
            "total_episodes": len(episodes),
            "total_outfits": sum(len(ep['outfits']) for ep in episodes),
            "version": "2.0",
            "updated": "2025-11-05"
        },
        "episodes": episodes
    }
    
    # 保存JSON文件
    with open('outfits.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    
    print(f"JSON转换成功！")
    print(f"总集数: {result['metadata']['total_episodes']}")
    print(f"总穿搭数: {result['metadata']['total_outfits']}")
    print(f"文件大小: {round(len(json.dumps(result, ensure_ascii=False))/1024, 2)} KB")
    
    # 显示第一集的数据作为验证
    if result['episodes']:
        print(f"\n第一集穿搭数量: {len(result['episodes'][0]['outfits'])}")
        if result['episodes'][0]['outfits']:
            print(f"第一套: {result['episodes'][0]['outfits'][0]['title']}")
else:
    print("Failed to parse data.js")
