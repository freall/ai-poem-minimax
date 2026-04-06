#!/usr/bin/env python3
import subprocess, json, os
from concurrent.futures import ThreadPoolExecutor, as_completed

with open('/workspace/poem-learning/img_urls.json') as f:
    urls = json.load(f)

os.makedirs('/workspace/poem-learning/images', exist_ok=True)

def download_one(item):
    pid, url = item
    ext = '.jpg'
    if '.png' in url.lower(): ext = '.png'
    out = f'/workspace/poem-learning/images/{pid}{ext}'
    if os.path.exists(out) and os.path.getsize(out) > 5000:
        return pid, 'skip', os.path.getsize(out)
    r = subprocess.run(['curl', '-s', '-L', '--max-time', '30', '-o', out, url], capture_output=True)
    if r.returncode == 0 and os.path.exists(out) and os.path.getsize(out) > 5000:
        return pid, 'ok', os.path.getsize(out)
    return pid, 'fail', url

items = sorted(urls.items(), key=lambda x: int(x[0]))
done = 0
total = len(items)
failed = []

with ThreadPoolExecutor(max_workers=8) as ex:
    futures = {ex.submit(download_one, item): item for item in items}
    for fut in as_completed(futures):
        pid, status, val = fut.result()
        done += 1
        if status == 'ok':
            print(f'[{done}/{total}] {pid}: OK ({val} bytes)')
        elif status == 'skip':
            print(f'[{done}/{total}] {pid}: SKIP ({val} bytes)')
        else:
            print(f'[{done}/{total}] {pid}: FAIL')
            failed.append(pid)
        if done >= total: break

print(f'\nDone: {done}/{total}')
if failed:
    # retry failed ones once
    print(f'Retrying {len(failed)} failed...')
    for pid in failed:
        for item in items:
            if str(item[0]) == str(pid):
                pid2, status2, val2 = download_one(item)
                print(f'  Retry {pid2}: {status2}')
                break
