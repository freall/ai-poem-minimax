#!/bin/bash
# Image generation batches - called by cron jobs
BATCH=${1:-1}

declare -A PROMPTS
PROMPTS[1]="立春偶成，律回岁晚冰霜少，春到人间草木知，春回大地万物复苏，古风水墨画，中国传统绘画，宣纸质感，淡淡设色，诗意朦胧，竖版"
PROMPTS[2]="咏柳，碧玉妆成一树高，万条垂下绿丝绦，春风拂柳，柳绿花红，古风水墨画，中国传统绘画，宣纸质感，淡淡设色，诗意朦胧，竖版"
PROMPTS[3]="春夜喜雨，好雨知时节，当春乃发生，随风潜入夜，润物细无声，春雨潇潇，古风水墨画，中国传统绘画，宣纸质感，淡淡设色，诗意朦胧"
PROMPTS[4]="绝句，迟日江山丽，春风花草香，泥融飞燕子，沙暖睡鸳鸯，春日明媚，山河秀丽，古风水墨画，中国传统绘画，宣纸质感，淡淡设色，诗意朦胧"
PROMPTS[5]="观田家，微雨众卉新，一雷惊蛰始，春耕田园，播种希望，古风水墨画，中国传统绘画，宣纸质感，淡淡设色，诗意朦胧，竖版布局"
PROMPTS[6]="新雷，造物无言却有情，每于寒尽觉春生，春雷滚滚，万物复苏，古风水墨画，中国传统绘画，宣纸质感，淡淡设色，诗意朦胧，竖版布局"
PROMPTS[7]="春分日，仲春初四日，春色正中分，昼夜平分，春天过半，古风水墨画，中国传统绘画，宣纸质感，淡淡设色，诗意朦胧，竖版布局"
PROMPTS[8]="村居，草长莺飞二月天，拂堤杨柳醉春烟，儿童嬉戏，春日乡村，古风水墨画，中国传统绘画，宣纸质感，淡淡设色，诗意朦胧，竖版布局"
PROMPTS[9]="清明，清明时节雨纷纷，路上行人欲断魂，牧童遥指杏花村，烟雨朦胧，古风水墨画，中国传统绘画，宣纸质感，淡淡设色，诗意朦胧，竖版布局"
PROMPTS[10]="寒食，春城无处不飞花，寒食东风御柳斜，春天飞花，寒食禁火，古风水墨画，中国传统绘画，宣纸质感，淡淡设色，诗意朦胧，竖版布局"

for i in $(seq 1 10); do
  IDX=$(( (BATCH-1)*10 + i ))
  FILE="/workspace/poems-img/${IDX}.jpg"
  if [ ! -f "$FILE" ] || [ ! -s "$FILE" ]; then
    echo "Batch $BATCH: Generating ID $IDX..."
    # Write a placeholder so we know it's being processed
    touch "/workspace/poems-img/${IDX}.generating"
  else
    echo "Batch $BATCH: ID $IDX already exists, skipping"
  fi
done
echo "Batch $BATCH prepared. Run image generation manually for best results."
