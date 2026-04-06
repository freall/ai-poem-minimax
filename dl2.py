#!/usr/bin/env python3
import subprocess, json, os
from concurrent.futures import ThreadPoolExecutor

alternatives = {
    37: ("https://bkimg.cdn.bcebos.com/pic/d1160924ab18972bd4078748f3836c899e510eb39ca9?x-bce-process=image/format,f_auto", "jpg"),
    38: ("http://www.exam58.com/uploads/allimg/150128/1-15012Q34340J8.jpg", "jpg"),
    39: ("https://pic1.hebccw.cn/003/026/249/00302624976_cdb52276.jpg", "jpg"),
    45: ("https://www.xxshihui.com/xxsh/2022/01/PhotoDown/202204155749770_0.jpg", "jpg"),
    46: ("https://shipeihua.oss-cn-beijing.aliyuncs.com/d/file/202504/4162f67cbbd79dd785dd6f59f4b9040e.jpeg", "jpg"),
    49: ("http://www.exam58.com/uploads/allimg/130722/102534N20-0.jpg", "jpg"),
    63: ("https://shipeihua.oss-cn-beijing.aliyuncs.com/d/file/202506/aa73d04db8c809973c2cf6e103330ab6.jpg", "jpg"),
    64: ("https://shipeihua.oss-cn-beijing.aliyuncs.com/d/file/202408/241cf9be5cdba281a991fe92191faf20.jpeg", "jpg"),
    65: ("https://shipeihua.oss-cn-beijing.aliyuncs.com/d/file/202504/4162f67cbbd79dd785dd6f59f4b9040e.jpeg", "jpg"),
    66: ("https://shipeihua.oss-cn-beijing.aliyuncs.com/d/file/202511/a1b714f04033cce4e59e4a8e8893e0e9.jpg", "jpg"),
    68: ("https://m.gxgif.com/pic/dwj/2024329185944.jpg", "jpg"),
    69: ("https://imgs.699pic.com/images/500/383/540.jpg!detail.v1", "jpg"),
    75: ("https://shipeihua.oss-cn-beijing.aliyuncs.com/d/file/202405/b62ea1daad32fe4092e085ccdf226320.jpg", "jpg"),
    76: ("https://bkimg.cdn.bcebos.com/pic/5ab5c9ea15ce36d3ef1f05d93cf33a87e950b1de0988", "jpg"),
    80: ("https://shipeihua.oss-cn-beijing.aliyuncs.com/d/file/202405/b62ea1daad32fe4092e085ccdf226320.jpg", "jpg"),
}

def download(item):
    pid, (url, ext) = item
    out = f'/workspace/poem-learning/images/{pid}.{ext}'
    r = subprocess.run(['curl', '-s', '-L', '--max-time', '25', '-o', out, url], capture_output=True)
    if os.path.exists(out) and os.path.getsize(out) > 8000:
        return pid, 'OK', os.path.getsize(out)
    return pid, 'FAIL', None

items = list(alternatives.items())
done = 0
with ThreadPoolExecutor(max_workers=6) as ex:
    futures = {ex.submit(download, item): item for item in items}
    for fut in futures:
        pid, status, sz = fut.result()
        done += 1
        if status == 'OK':
            print(f'[{done}/{len(items)}] {pid}: OK ({sz} bytes)')
        else:
            print(f'[{done}/{len(items)}] {pid}: FAIL')
