#!/usr/bin/env python3
import subprocess, json, os, sys

with open('/workspace/poem-learning/img_urls.json') as f:
    urls = json.load(f)

os.makedirs('/workspace/poem-learning/images', exist_ok=True)

total = len(urls)
done = 0
failed = []

for pid in sorted(urls.keys(), key=lambda x: int(x)):
    url = urls[pid]
    ext = '.jpg'
    if '.png' in url.lower(): ext = '.png'
    out = f'/workspace/poem-learning/images/{pid}{ext}'

    if os.path.exists(out) and os.path.getsize(out) > 5000:
        print(f'SKIP {pid} (exists, {os.path.getsize(out)} bytes)')
        done += 1
        continue

    print(f'DL {pid}: {url[:60]}...')
    r = subprocess.run(
        ['curl', '-s', '-L', '--max-time', '30', '-o', out, url],
        capture_output=True
    )
    if r.returncode == 0 and os.path.exists(out) and os.path.getsize(out) > 5000:
        sz = os.path.getsize(out)
        print(f'  OK {sz} bytes')
        done += 1
    else:
        print(f'  FAIL (exit {r.returncode})')
        failed.append((pid, url))
    print(f'Progress: {done}/{total}')

print(f'\nTotal: {done}/{total} downloaded')
if failed:
    print(f'Failed ({len(failed)}):')
    for pid, url in failed:
        print(f'  {pid}: {url}')
