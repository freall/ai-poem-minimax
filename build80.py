#!/usr/bin/env python3
import zipfile, re, json, random

fpath = '/workspace/user_input_files/语文节诗词大赛（24节气+传统节日）诗词库.docx'
with zipfile.ZipFile(fpath, 'r') as z:
    with z.open('word/document.xml') as x:
        content = x.read().decode('utf-8')

texts = re.findall(r'<w:t[^>]*>([^<]+)</w:t>', content)
full = '\n'.join(t for t in texts if t.strip())
lines = full.split('\n')

poems_raw = []
current = None
current_festival = None

season_keys = ['立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至','小寒','大寒']
season_map = {
    '立春':'春季','雨水':'春季','惊蛰':'春季','春分':'春季','清明':'春季','谷雨':'春季',
    '立夏':'夏季','小满':'夏季','芒种':'夏季','夏至':'夏季','小暑':'夏季','大暑':'夏季',
    '立秋':'秋季','处暑':'秋季','白露':'秋季','秋分':'秋季','寒露':'秋季','霜降':'秋季',
    '立冬':'冬季','小雪':'冬季','大雪':'冬季','冬至':'冬季','小寒':'冬季','大寒':'冬季'
}
season_keys = ['立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至','小寒','大寒']
all_authors = ['李白','杜甫','王维','白居易','贺知章','杜牧','韩愈','苏轼','王安石','孟浩然',
               '杨万里','陆游','刘禹锡','柳宗元','张维屏','徐铉','高鼎','韩翃','王令',
               '韦应物','秦观','曾几','范成大','刘翰','许浑','岑参','张栻','窦常','文徵明',
               '刘长卿','叶燮','辛弃疾','卢照邻','崔液','苏味道','唐寅','温庭筠','吴惟信',
               '王禹偁','殷尧藩','卢肇','林杰','罗隐','王建','晏殊','李清照','高适','马致远','苏泂']

# Festival names
fest_names = ['春节','元宵节','寒食节','清明节','端午节','七夕节','中秋节','重阳节','除夕']

for line in lines:
    line = line.strip()
    if not line:
        continue
    # Check for festival section header like "1. 春节（6首）"
    fest_pat = '|'.join(fest_names)
    fm = re.match(r'^\d+\.\s+(' + fest_pat + r')（\d+首）', line)
    if fm:
        current_festival = fm.group(1)
        continue
    # Solar term poem: 1. 立春：《立春偶成》（宋·张栻）—— 内容
    term_pat = '|'.join(season_keys)
    m_solar = re.match(r'^(\d+)\.\s+(' + term_pat + r')：(.+?)（(.+?)·(.+?)）——(.+)$', line)
    if m_solar:
        if current:
            poems_raw.append(current)
        current = {
            'id': int(m_solar.group(1)),
            'poem': m_solar.group(3).strip(),
            'dynasty': m_solar.group(4).strip(),
            'author': m_solar.group(5).strip(),
            'content': m_solar.group(6).strip(),
            'festival': None
        }
    # Festival poem: 49. 《元日》（宋·王安石）—— 内容
    elif current_festival:
        m = re.match(r'^(\d+)\.\s+《(.+?)》（(.+?)·(.+?)）——\s*(.+)$', line)
        if m:
            if current:
                poems_raw.append(current)
            current = {
                'id': int(m.group(1)),
                'poem': m.group(2).strip(),
                'dynasty': m.group(3).strip(),
                'author': m.group(4).strip(),
                'content': m.group(5).strip(),
                'festival': current_festival
            }
        elif current and line:
            current['content'] += '\n' + line.strip()
    elif current and line:
        current['content'] += '\n' + line.strip()

if current:
    poems_raw.append(current)

print(f"Extracted {len(poems_raw)} poems")
for p in poems_raw[-3:]:
    print(f"  {p['id']}: {p['poem']} ({p.get('festival','solar')})")

def make_quizzes(p):
    ca = p['author']
    opts = [ca]
    for a in all_authors:
        if a != ca and len(opts) < 4:
            opts.append(a)
    random.shuffle(opts)
    ai = opts.index(ca)
    fl = p['content'].split('\n')[0][:20]
    return [
        {'q': '《' + p['poem'] + '》的作者是谁？',
         'options': opts, 'answer': ai,
         'explanation': '这首诗的作者是' + p['dynasty'] + '的' + p['author'] + '。'},
        {'q': '《' + p['poem'] + '》描写的是什么内容？',
         'options': ['应景的季节或节日景象', '春天景色', '夏天景色', '秋天景色'],
         'answer': 0, 'explanation': '根据诗题和内容判断。'},
        {'q': '《' + p['poem'] + '》的开篇是哪一句？',
         'options': [fl, '选项B', '选项C', '选项D'],
         'answer': 0, 'explanation': '诗文首句通常点明主题。'}
    ]

result = []
for p in poems_raw:
    fest = p.get('festival')
    if fest:
        cat, season, term = 'festival', '', fest
    else:
        term = ''
        for t in season_map:
            if t in p['poem']:
                term = t
                break
        if not term:
            term = '清明'
        season = season_map.get(term, '春季')
        cat = 'solar'
    
    result.append({
        'id': p['id'],
        'category': cat,
        'season': season,
        'term': term if cat == 'solar' else '',
        'festivalName': term if cat == 'festival' else '',
        'poem': p['poem'],
        'author': p['author'],
        'dynasty': p['dynasty'],
        'content': p['content'],
        'translation': '《' + p['poem'] + '》是' + p['dynasty'] + '诗人' + p['author'] + '的名篇。',
        'background': '《' + p['poem'] + '》是' + p['dynasty'] + '诗人' + p['author'] + '的代表作之一。',
        'authorIntro': p['author'] + '（' + p['dynasty'] + '），著名诗人。',
        'imageUrl': '',
        'quizzes': make_quizzes(p)
    })

with open('/workspace/poem-learning/poems80.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print(f"\nSaved {len(result)} poems")
print(f"Solar: {sum(1 for x in result if x['category']=='solar')}")
print(f"Festival: {sum(1 for x in result if x['category']=='festival')}")
print(f"First: {result[0]['poem']} | {result[0]['season']}/{result[0]['term'] or result[0]['festivalName']}")
print(f"Last: {result[-1]['poem']} | {result[-1]['category']}")
