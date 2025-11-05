import os
import requests

# 读取图片列表 - 使用utf-8编码
with open('image_urls.txt', 'r', encoding='utf-8') as f:
    images = [line.strip() for line in f.readlines() if line.strip()]

# 创建目录并下载
base_url = "https://nutllwhy.github.io/xuwoyaoyan/"
total = len(images)
success = 0
failed = []

for i, img_path in enumerate(images, 1):
    try:
        # 创建目录
        dir_path = os.path.dirname(img_path)
        if dir_path:
            os.makedirs(f'pic/{dir_path}', exist_ok=True)
        
        # 下载图片
        url = base_url + img_path
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            with open(f'pic/{img_path}', 'wb') as f:
                f.write(response.content)
            success += 1
            print(f"[{i:3d}/{total}] OK: {img_path}")
        else:
            failed.append(img_path)
            print(f"[{i:3d}/{total}] FAIL: {img_path} (Status: {response.status_code})")
    except Exception as e:
        failed.append(img_path)
        print(f"[{i:3d}/{total}] ERROR: {img_path}")

print(f"\nDownload complete! Success: {success}/{total} ({success/total*100:.1f}%)")
if failed:
    print(f"Failed count: {len(failed)}")
