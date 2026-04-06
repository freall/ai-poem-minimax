import zipfile, re, json, random, os

# Read docx
fpath = '/workspace/user_input_files/语文节诗词大赛（24节气+传统节日）诗词库.docx'
with zipfile.ZipFile(fpath, 'r') as z:
    with z.open('word/document.xml') as x:
        content = x.read().decode('utf-8')

texts = re.findall(r'<w:t[^>]*>([^<]+)</w:t>', content)
full = '\n'.join(t for t in texts if t.strip())

# Parse poems - track current section
poems_raw = []
lines = full.split('\n')
current = None
current_festival = None
current_solar_term = None
FESTIVALS = ['春节','元宵节','寒食节','清明节','端午节','七夕节','中秋节','重阳节','除夕']
SOLAR_TERMS = ['立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至','小寒','大寒']

for line in lines:
    line = line.strip()
    if not line:
        continue
    # Section header for festivals
    fmatch = re.match(r'^\d+\.\s+(['+'|'.join(FESTIVALS)+'])（\d+首）', line)
    if fmatch:
        current_festival = fmatch.group(1)
        current_solar_term = None
        continue
    # Section header for solar terms (just skip)
    if re.match(r'^['+'|'.join(['春夏秋冬'])+']季节气', line):
        current_festival = None
        continue
    # Poem line
    m = re.match(r'^(\d+)\.\s+《(.+?)》（(.+?)·(.+?)）——\s*(.+)$', line)
    if m:
        if current:
            poems_raw.append(current)
        poem_id = int(m.group(1))
        content = m.group(5).strip()
        current = {
            'id': poem_id,
            'poem': m.group(2).strip(),
            'dynasty': m.group(3).strip(),
            'author': m.group(4).strip(),
            'content': content,
            'festival': current_festival,
            'solar_term': current_solar_term
        }
    elif current and line:
        current['content'] += '\n' + line.strip()
if current:
    poems_raw.append(current)

print(f"Extracted {len(poems_raw)} poems")

print(f"Extracted {len(poems_raw)} poems")

SPRING = ['立春','雨水','惊蛰','春分','清明','谷雨']
SUMMER = ['立夏','小满','芒种','夏至','小暑','大暑']
AUTUMN_T = ['立秋','处暑','白露','秋分','寒露','霜降']
WINTER_T = ['立冬','小雪','大雪','冬至','小寒','大寒']
FESTIVALS = ['春节','元宵节','寒食节','清明节','端午节','七夕节','中秋节','重阳节','除夕']
SEASONS = {'立春':SPRING,'雨水':SPRING,'惊蛰':SPRING,'春分':SPRING,'清明':SPRING,'谷雨':SPRING,
           '立夏':SUMMER,'小满':SUMMER,'芒种':SUMMER,'夏至':SUMMER,'小暑':SUMMER,'大暑':SUMMER,
           '立秋':AUTUMN_T,'处暑':AUTUMN_T,'白露':AUTUMN_T,'秋分':AUTUMN_T,'寒露':AUTUMN_T,'霜降':AUTUMN_T,
           '立冬':WINTER_T,'小雪':WINTER_T,'大雪':WINTER_T,'冬至':WINTER_T,'小寒':WINTER_T,'大寒':WINTER_T}

ALL_AUTHORS = ['李白','杜甫','王维','白居易','贺知章','杜牧','韩愈','苏轼','王安石','孟浩然',
                '杨万里','陆游','刘禹锡','柳宗元','张维屏','徐铉','高鼎','韩翃','王令',
                '韦应物','秦观','曾几','范成大','刘翰','许浑','岑参','张栻','窦常','文徵明',
                '刘长卿','叶燮','辛弃疾','卢照邻','崔液','苏味道','唐寅','温庭筠','吴惟信',
                '王禹偁','殷尧藩','卢肇','林杰','罗隐','王建','晏殊','李清照','高适','马致远','苏泂']

SEASON_COLORS_MAP = {
    '春季': '#f472b6', '夏季': '#fbbf24', '秋季': '#f97316', '冬季': '#60a5fa'
}

def get_season(term):
    for s, terms in [('春季',SPRING),('夏季',SUMMER),('秋季',AUTUMN_T),('冬季',WINTER_T)]:
        if term in terms:
            return s
    return '春季'

def make_quizzes(p):
    correct_author = p['author']
    options = [correct_author]
    for a in ALL_AUTHORS:
        if a != correct_author and len(options) < 4:
            options.append(a)
    random.shuffle(options)
    answer_idx = options.index(correct_author)
    
    first_line = p['content'].split('\n')[0][:20]
    
    return [
        {'q': '《' + p['poem'] + '》的作者是谁？',
         'options': options,
         'answer': answer_idx,
         'explanation': '这首诗的作者是' + p['dynasty'] + '的' + p['author'] + '。'},
        {'q': '《' + p['poem'] + '》描写的是什么内容？',
         'options': ['应景的季节或节日景象','春天景色','夏天景色','秋天景色'],
         'answer': 0,
         'explanation': '根据诗题和内容判断。'},
        {'q': '《' + p['poem'] + '》的开篇是哪一句？',
         'options': [first_line, '选项B', '选项C', '选项D'],
         'answer': 0,
         'explanation': '诗文首句通常点明主题。'}
    ]

poems_final = []
for p in poems_raw:
    t = p['term_or_fest']
    if t in FESTIVALS:
        cat, season, term = 'festival', '', t
    else:
        cat, season, term = 'solar', get_season(t), t
    
    poems_final.append({
        'id': p['id'],
        'category': cat,
        'season': season,
        'term': term if cat == 'solar' else '',
        'festivalName': term if cat == 'festival' else '',
        'poem': p['poem'],
        'author': p['author'],
        'dynasty': p['dynasty'],
        'content': p['content'],
        'translation': f'《{p["poem"]}》是{p["dynasty"]}诗人{p["author"]}的名篇，描写了富有意境的画面。',
        'background': f'《{p["poem"]}》是{p["dynasty"]}诗人{p["author"]}的代表作之一。',
        'authorIntro': f'{p["author"]}（{p["dynasty"]}），著名诗人，其诗风独树一帜。',
        'imageUrl': '',
        'quizzes': make_quizzes(p)
    })

with open('/workspace/poem-learning/poems80.json','w',encoding='utf-8') as f:
    json.dump(poems_final, f, ensure_ascii=False, indent=2)

print(f"Saved {len(poems_final)} poems")
print(f"Solar: {sum(1 for p in poems_final if p['category']=='solar')}")
print(f"Festival: {sum(1 for p in poems_final if p['category']=='festival')}")
print(f"Sample: {poems_final[0]['poem']} | {poems_final[0]['season']}/{poems_final[0]['term']}")
print(f"Festival sample: {poems_final[48]['poem']} | {poems_final[48]['festivalName']}")
