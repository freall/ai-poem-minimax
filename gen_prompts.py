#!/usr/bin/env python3
import json, re

with open('/workspace/poem-learning/poems80.json') as f:
    poems = json.load(f)

SEASON_SCENE = {
    '春季': '春回大地，柳绿花红，烟雨江南，桃花流水，春意盎然',
    '夏季': '夏日莲叶，荷花映日，蝉鸣竹林，清风徐来',
    '秋季': '秋风瑟瑟，红叶满山，明月相思，枫林如火',
    '冬季': '冬雪皑皑，寒江独钓，岁寒三友，白雪红梅',
    '春节': '红灯高挂，烟花鞭炮，喜庆团圆，年味十足',
    '元宵节': '花灯璀璨，明月当空，龙舞凤翔，火树银花',
    '清明节': '细雨纷纷，杏花春雨，踏青祭祖，烟雨朦胧',
    '节端午节': '龙舟竞渡，粽子艾香，屈原怀古，碧波荡漾',
    '七夕节': '银河鹊桥，牛郎织女，花前月下，繁星点点',
    '中秋节': '明月皎洁，桂花飘香，团圆赏月，玉盘银辉',
    '重阳节': '登高望远，菊花黄酒，茱萸辟邪，秋色连波',
    '除夕': '守岁迎新，阖家团圆，辞旧迎新，灯火通明',
}

prompts = {}
for p in poems:
    if p.get('imgUrl'):
        continue
    season = p.get('season') or p.get('festivalName') or ''
    title = p.get('poem', '').replace('《', '').replace('》', '')
    content = p.get('content') or ''
    # Split by common Chinese punctuation
    lines = re.split(r'[，。、；]', content)
    lines = [l.strip() for l in lines if l.strip()]
    key = '，'.join(lines[:2])
    scene = SEASON_SCENE.get(season, '山水云烟，诗意盎然')
    style = '古风水墨画，中国传统绘画风格，宣纸质感，淡雅设色，诗意朦胧，大师作品'
    prompts[p['id']] = '%s，%s，%s，%s' % (title, key, scene, style)

with open('/workspace/poem-learning/img_prompts.json', 'w', encoding='utf-8') as f:
    json.dump(prompts, f, ensure_ascii=False, indent=2)

need = sorted(prompts.keys(), key=lambda x: int(x))
print('Poems needing images: %d' % len(need))
print('IDs:', need)
