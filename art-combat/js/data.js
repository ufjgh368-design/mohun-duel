/* ═══════════════════════════════════════════════
   Canvas Combat 西洋藝術大亂鬥 — 角色資料與遊戲定義
   ═══════════════════════════════════════════════ */

/* 流派相剋:剋制方傷害 ×1.15,被剋方傷害 ×0.85 */
const FACTIONS = {
  '文藝復興':   { icon: '🏛', beats: '巴洛克與浪漫' },
  '巴洛克與浪漫': { icon: '🔥', beats: '印象與後印象' },
  '印象與後印象': { icon: '🌿', beats: '現代藝術革命' },
  '現代藝術革命': { icon: '💥', beats: '文藝復興' },
};
function factionMult(atkChar, defChar) {
  const fa = FACTIONS[atkChar.medium], fd = FACTIONS[defChar.medium];
  if (!fa || !fd) return 1;
  if (fa.beats === defChar.medium) return 1.15;
  if (fd.beats === atkChar.medium) return 0.85;
  return 1;
}

const CHARACTERS = [
  /* ══ 文藝復興 ══ */
  {
    id: 'giotto', name: '喬托', mono: '喬', img: 'assets/char/giotto.png', medium: '文藝復興',
    title: '破曉聖手', era: '1267 – 1337', origin: '義大利・佛羅倫斯近郊',
    tags: ['文藝復興先驅', '濕壁畫', '喬托的O'],
    desc: '中世紀與文藝復興之間的破曉之人。他讓聖像走下金色天國,有了重量、淚水與呼吸;帕多瓦斯克羅威尼禮拜堂的滿堂壁畫,是歐洲繪畫的黎明。',
    stats: { atk: 7, def: 8, spd: 6, wis: 9 }, difficulty: 4,
    hue: 30, hue2: 210,
    skills: {
      light: { name: '喬托的O', desc: '徒手正圓的絕對精準' },
      heavy: { name: '猶大之吻', desc: '壁畫史上最沉重的擁抱' },
      ultra: { name: '斯克羅威尼禮拜堂', desc: '滿堂壁畫,黎明震響' },
    },
    works: [
      { title: '斯克羅威尼禮拜堂壁畫', year: 1305, note: '帕多瓦的濕壁畫鉅作' },
      { title: '猶大之吻', year: 1305, note: '戲劇性的對峙瞬間' },
      { title: '聖方濟接受聖痕', year: 1295, note: '阿西西傳說系列' },
    ],
  },
  {
    id: 'donatello', name: '多納太羅', mono: '納', img: 'assets/char/donatello.png', medium: '文藝復興',
    title: '青銅先鋒', era: '1386 – 1466', origin: '義大利・佛羅倫斯',
    tags: ['早期文藝復興', '雕塑', '青銅'],
    desc: '早期文藝復興的雕塑革命者。青銅《大衛》是古典時代之後第一件獨立裸身立像,他把透視與人體解剖帶回雕塑,為後來的米開朗基羅鋪好了路。',
    stats: { atk: 9, def: 7, spd: 6, wis: 8 }, difficulty: 4,
    hue: 170, hue2: 40,
    skills: {
      light: { name: '淺浮雕', desc: '薄如蟬翼的空間魔術' },
      heavy: { name: '加塔梅拉塔', desc: '青銅騎士踏陣而來' },
      ultra: { name: '青銅大衛', desc: '少年英雄,一擊定音' },
    },
    works: [
      { title: '青銅大衛', year: 1440, note: '文藝復興雕塑的里程碑' },
      { title: '加塔梅拉塔騎馬像', year: 1453, note: '帕多瓦的傭兵隊長' },
      { title: '聖喬治', year: 1417, note: '佛羅倫斯行會壁龕之作' },
    ],
  },
  {
    id: 'vaneyck', name: '范艾克', mono: '艾', img: 'assets/char/vaneyck.png', medium: '文藝復興',
    title: '油彩鍊金師', era: '1390 – 1441', origin: '尼德蘭・馬斯艾克',
    tags: ['北方文藝復興', '油畫先驅', '細節'],
    desc: '北方文藝復興的開創者,把油彩層疊技法推向極致——凸面鏡、黃銅吊燈、每一根毛髮都纖毫畢現;《根特祭壇畫》與《阿諾菲尼夫婦》至今仍是寫實的極限。',
    stats: { atk: 6, def: 9, spd: 6, wis: 10 }, difficulty: 4,
    hue: 200, hue2: 120,
    skills: {
      light: { name: '細密筆觸', desc: '纖毫畢現的精描連擊' },
      heavy: { name: '凸面鏡', desc: '鏡中世界的反射衝擊' },
      ultra: { name: '根特祭壇畫', desc: '神祕羔羊,聖光全開' },
    },
    works: [
      { title: '根特祭壇畫', year: 1432, note: '北方文藝復興的里程碑' },
      { title: '阿諾菲尼夫婦', year: 1434, note: '凸面鏡與「范艾克在此」' },
      { title: '包紅頭巾的男子', year: 1433, note: '疑似畫家自畫像' },
    ],
  },
  {
    id: 'botticelli', name: '波提切利', mono: '波', img: 'assets/char/botticelli.png', medium: '文藝復興',
    title: '春之詩人', era: '1445 – 1510', origin: '義大利・佛羅倫斯',
    tags: ['佛羅倫斯畫派', '神話畫', '美第奇'],
    desc: '佛羅倫斯畫派巨匠,在美第奇家族贊助下以《春》與《維納斯的誕生》將希臘神話之美帶回人間,線條優雅如詩,是文藝復興黃金年代最溫柔的歌者。',
    stats: { atk: 6, def: 6, spd: 9, wis: 8 }, difficulty: 2,
    hue: 340, hue2: 150,
    skills: {
      light: { name: '優雅線描', desc: '流暢如絲的輪廓連擊' },
      heavy: { name: '三美神之舞', desc: '春日群花的迴旋重擊' },
      ultra: { name: '維納斯的誕生', desc: '貝殼綻放,愛與美降臨' },
    },
    works: [
      { title: '春', year: 1482, note: '維納斯花園中的神話群像' },
      { title: '維納斯的誕生', year: 1485, note: '文藝復興最著名的神話畫' },
      { title: '誹謗', year: 1495, note: '晚期的寓意告白' },
    ],
  },
  {
    id: 'leonardo', name: '達文西', mono: '達', img: 'assets/char/leonardo.png', medium: '文藝復興',
    title: '智慧鍊金術師', era: '1452 – 1519', origin: '義大利・文西鎮',
    tags: ['全能天才', '蒙娜麗莎', '手稿'],
    desc: '畫家、科學家、發明家於一身的全能天才。以暈塗法畫出《蒙娜麗莎》的神祕微笑,數千頁鏡像手稿探索人體、飛行與宇宙的奧祕,晚年受法王之邀終老法國。',
    stats: { atk: 8, def: 7, spd: 7, wis: 10 }, difficulty: 3,
    hue: 45, hue2: 200,
    skills: {
      light: { name: '鏡像手稿', desc: '左手反寫的智慧速記' },
      heavy: { name: '最後的晚餐', desc: '十二門徒的震盪瞬間' },
      ultra: { name: '萬能天才・維特魯威人', desc: '圓與方之中,人是萬物的尺度' },
    },
    works: [
      { title: '蒙娜麗莎', year: 1503, note: '羅浮宮鎮館之寶' },
      { title: '最後的晚餐', year: 1498, note: '米蘭恩寵聖母修道院壁畫' },
      { title: '維特魯威人', year: 1490, note: '人體比例的傳世素描' },
    ],
  },
  {
    id: 'michelangelo', name: '米開朗基羅', mono: '米', img: 'assets/char/michelangelo.png', medium: '文藝復興',
    title: '雕刻戰神', era: '1475 – 1564', origin: '義大利・卡普雷塞',
    tags: ['雕塑', '西斯汀', '三傑'],
    desc: '自稱雕刻家的全能巨匠。鑿出《大衛像》與《聖殤》,仰首四年獨力繪成西斯汀禮拜堂天頂畫,一生以近乎神性的意志追求人體的力與美。',
    stats: { atk: 10, def: 8, spd: 5, wis: 8 }, difficulty: 4,
    hue: 25, hue2: 210,
    skills: {
      light: { name: '鑿刀連擊', desc: '大理石飛屑的精準打擊' },
      heavy: { name: '創世紀穹頂', desc: '指尖相觸,神性灌注' },
      ultra: { name: '大衛覺醒', desc: '大理石巨人睜眼的一擊' },
    },
    works: [
      { title: '聖殤', year: 1499, note: '聖彼得大教堂的悲憫之作' },
      { title: '大衛像', year: 1504, note: '佛羅倫斯學院美術館鎮館' },
      { title: '創世紀天頂畫', year: 1512, note: '西斯汀禮拜堂的曠世穹頂' },
    ],
  },
  {
    id: 'raphael', name: '拉斐爾', mono: '拉', img: 'assets/char/raphael.png', medium: '文藝復興',
    title: '聖殿守護者', era: '1483 – 1520', origin: '義大利・烏爾比諾',
    tags: ['和諧', '聖母像', '三傑'],
    desc: '文藝復興三傑中最年輕的天才。筆下聖母溫柔典雅,《雅典學院》讓古今智者齊聚一堂;37 歲驟逝,全羅馬為他送葬。',
    stats: { atk: 7, def: 8, spd: 8, wis: 9 }, difficulty: 2,
    hue: 210, hue2: 45,
    skills: {
      light: { name: '優雅構圖', desc: '完美平衡的柔性攻勢' },
      heavy: { name: '西斯汀聖母', desc: '聖母垂憐的凝視' },
      ultra: { name: '雅典學院', desc: '群賢降臨,智慧共鳴' },
    },
    works: [
      { title: '雅典學院', year: 1511, note: '梵蒂岡簽字廳壁畫' },
      { title: '西斯汀聖母', year: 1512, note: '畫底兩位小天使聞名於世' },
      { title: '草地上的聖母', year: 1506, note: '聖母像的溫柔典範' },
    ],
  },
  {
    id: 'titian', name: '提香', mono: '提', img: 'assets/char/titian.png', medium: '文藝復興',
    title: '色彩君王', era: '1488 – 1576', origin: '義大利・卡多雷',
    tags: ['威尼斯畫派', '色彩', '宮廷'],
    desc: '威尼斯畫派的掌門人,以華麗色彩與奔放筆觸稱霸歐洲畫壇近一甲子;據傳神聖羅馬皇帝查理五世曾俯身為他撿拾畫筆。',
    stats: { atk: 8, def: 7, spd: 7, wis: 8 }, difficulty: 3,
    hue: 15, hue2: 350,
    skills: {
      light: { name: '威尼斯暖彩', desc: '金紅色調的華麗速寫' },
      heavy: { name: '聖母升天', desc: '金光沖天的祭壇重擊' },
      ultra: { name: '酒神的狂歡', desc: '色彩傾瀉的神話盛宴' },
    },
    works: [
      { title: '聖母升天', year: 1518, note: '威尼斯榮耀聖母教堂祭壇畫' },
      { title: '烏爾比諾的維納斯', year: 1538, note: '斜臥維納斯的經典' },
      { title: '酒神與亞里阿德涅', year: 1523, note: '神話色彩的鉅作' },
    ],
  },

  /* ══ 巴洛克與浪漫 ══ */
  {
    id: 'caravaggio', name: '卡拉瓦喬', mono: '卡', img: 'assets/char/caravaggio.png', medium: '巴洛克與浪漫',
    title: '暗影審判者', era: '1571 – 1610', origin: '義大利・米蘭',
    tags: ['巴洛克', '明暗法', '亡命浪子'],
    desc: '以強烈的明暗對照法撕開黑暗,讓聖經人物走入市井酒館。天才與暴烈並存,鬥毆殺人後亡命天涯,38 歲客死歸途,卻照亮了整個巴洛克。',
    stats: { atk: 10, def: 5, spd: 8, wis: 6 }, difficulty: 4,
    hue: 0, hue2: 40,
    skills: {
      light: { name: '暗巷突襲', desc: '黑暗中竄出的利刃' },
      heavy: { name: '聖馬太蒙召', desc: '一道斜光刺破黑暗' },
      ultra: { name: '光與影的審判', desc: '極限明暗,靈魂現形' },
    },
    works: [
      { title: '聖馬太蒙召', year: 1600, note: '戲劇性光線的代表作' },
      { title: '酒神', year: 1596, note: '青年時期的微醺自況' },
      { title: '大衛與歌利亞', year: 1610, note: '以自己的臉畫下巨人首級' },
    ],
  },
  {
    id: 'rubens', name: '魯本斯', mono: '魯', img: 'assets/char/rubens.png', medium: '巴洛克與浪漫',
    title: '動勢王子', era: '1577 – 1640', origin: '法蘭德斯・安特衛普',
    tags: ['巴洛克', '豐滿動感', '外交官'],
    desc: '佛蘭德斯巴洛克的王者。畫面豐滿、色彩流動如慶典,大畫室產量驚人;更身兼外交官促成英西和談,獲兩國冊封,是名副其實的「畫家中的王子」。',
    stats: { atk: 9, def: 8, spd: 7, wis: 8 }, difficulty: 3,
    hue: 350, hue2: 45,
    skills: {
      light: { name: '飛騰筆勢', desc: '斜對角動勢的速攻' },
      heavy: { name: '瑪麗皇后組畫', desc: '廿四連畫排山倒海' },
      ultra: { name: '巴洛克狂宴', desc: '血肉與色彩的漩渦' },
    },
    works: [
      { title: '上十字架', year: 1610, note: '安特衛普大教堂祭壇鉅作' },
      { title: '瑪麗・德・美第奇生平組畫', year: 1625, note: '羅浮宮專廳的廿四連作' },
      { title: '三美神', year: 1635, note: '豐滿人體的頌歌' },
    ],
  },
  {
    id: 'velazquez', name: '委拉斯奎茲', mono: '委', img: 'assets/char/velazquez.png', medium: '巴洛克與浪漫',
    title: '鏡中侍臣', era: '1599 – 1660', origin: '西班牙・塞維亞',
    tags: ['西班牙黃金時代', '宮女', '光影'],
    desc: '西班牙黃金時代的宮廷之眼。他以近乎印象派的鬆動筆觸捕捉空氣與光,《宮女》把畫家、公主與鏡中的國王織成藝術史上最深的謎。',
    stats: { atk: 8, def: 8, spd: 7, wis: 9 }, difficulty: 3,
    hue: 280, hue2: 30,
    skills: {
      light: { name: '鬆動筆觸', desc: '遠看即真的光之魔法' },
      heavy: { name: '教宗肖像', desc: '「太真實了」的逼視' },
      ultra: { name: '宮女', desc: '鏡中之鏡,空間反轉' },
    },
    works: [
      { title: '宮女', year: 1656, note: '普拉多美術館的鎮館之謎' },
      { title: '教宗英諾森十世肖像', year: 1650, note: '教宗驚呼「太真實了」' },
      { title: '布雷達之降', year: 1635, note: '歷史畫裡的人性時刻' },
    ],
  },
  {
    id: 'rembrandt', name: '林布蘭', mono: '林', img: 'assets/char/rembrandt.png', medium: '巴洛克與浪漫',
    title: '光影宗師', era: '1606 – 1669', origin: '荷蘭・萊頓',
    tags: ['荷蘭黃金時代', '夜巡', '自畫像'],
    desc: '荷蘭黃金時代的靈魂。以「林布蘭光」照亮人性深處,近百幅自畫像誠實記錄從榮耀到破產的一生,蝕刻版畫亦冠絕當世。',
    stats: { atk: 8, def: 9, spd: 5, wis: 9 }, difficulty: 3,
    hue: 40, hue2: 25,
    skills: {
      light: { name: '蝕刻針筆', desc: '銅版上的精細刻痕' },
      heavy: { name: '解剖課', desc: '精準剖析敵手弱點' },
      ultra: { name: '夜巡', desc: '巡守隊自黑暗中開步走來' },
    },
    works: [
      { title: '夜巡', year: 1642, note: '阿姆斯特丹國家博物館鎮館' },
      { title: '杜爾普醫師的解剖課', year: 1632, note: '一舉成名的群像畫' },
      { title: '自畫像系列', year: 1669, note: '一生的靈魂履歷' },
    ],
  },
  {
    id: 'vermeer', name: '維梅爾', mono: '維', img: 'assets/char/vermeer.png', medium: '巴洛克與浪漫',
    title: '靜光詩人', era: '1632 – 1675', origin: '荷蘭・臺夫特',
    tags: ['風俗畫', '珍珠', '寧靜'],
    desc: '臺夫特的謎樣畫家,一生僅留下三十餘幅作品。他把倒牛奶、讀信這樣的日常一瞬凝成永恆,窗邊灑落的光就是他的簽名。',
    stats: { atk: 5, def: 9, spd: 7, wis: 10 }, difficulty: 3,
    hue: 210, hue2: 55,
    skills: {
      light: { name: '窗光一瞥', desc: '靜謐日光的柔性突刺' },
      heavy: { name: '倒牛奶的女僕', desc: '專注日常的沉穩之力' },
      ultra: { name: '戴珍珠耳環的少女', desc: '回眸一瞬,時間停止' },
    },
    works: [
      { title: '戴珍珠耳環的少女', year: 1665, note: '「北方的蒙娜麗莎」' },
      { title: '倒牛奶的女僕', year: 1658, note: '荷蘭風俗畫經典' },
      { title: '臺夫特一景', year: 1661, note: '故鄉上空的天光' },
    ],
  },
  {
    id: 'goya', name: '哥雅', mono: '哥', img: 'assets/char/goya.png', medium: '巴洛克與浪漫',
    title: '黑暗預言者', era: '1746 – 1828', origin: '西班牙・薩拉戈薩',
    tags: ['宮廷畫家', '黑色繪畫', '戰爭'],
    desc: '西班牙宮廷首席畫家。中年失聰後畫風轉向黑暗,《1808年5月3日》控訴戰爭暴行,晚年在自宅牆上留下直視人性深淵的「黑色繪畫」。',
    stats: { atk: 9, def: 6, spd: 7, wis: 8 }, difficulty: 4,
    hue: 280, hue2: 0,
    skills: {
      light: { name: '諷刺版畫', desc: '《奇想集》的尖銳嘲諷' },
      heavy: { name: '巨人', desc: '山嶺般的暗影壓境' },
      ultra: { name: '1808年5月3日', desc: '白衣者張臂,槍聲中的怒吼' },
    },
    works: [
      { title: '1808年5月3日', year: 1814, note: '控訴戰爭的不朽之作' },
      { title: '裸體的瑪哈', year: 1800, note: '西班牙繪畫的傳奇' },
      { title: '農神吞噬其子', year: 1823, note: '黑色繪畫系列' },
    ],
  },
  {
    id: 'turner', name: '透納', mono: '透', img: 'assets/char/turner.png', medium: '巴洛克與浪漫',
    title: '風暴光神', era: '1775 – 1851', origin: '英國・倫敦',
    tags: ['浪漫主義', '光與霧', '海景'],
    desc: '英國浪漫主義風景大師。把暴風雪、蒸汽與落日熔成一片燦爛光海,晚年的畫近乎抽象,被後世尊為印象派的先聲。',
    stats: { atk: 8, def: 6, spd: 9, wis: 7 }, difficulty: 3,
    hue: 35, hue2: 200,
    skills: {
      light: { name: '水彩疾風', desc: '迅捷的大氣渲染' },
      heavy: { name: '雨、蒸汽和速度', desc: '火車自霧中轟鳴而過' },
      ultra: { name: '無畏號的落日', desc: '金色餘暉中的最後航程' },
    },
    works: [
      { title: '被拖去解體的無畏號', year: 1839, note: '英國人票選最愛名畫' },
      { title: '雨、蒸汽和速度', year: 1844, note: '工業時代的光之詩' },
      { title: '暴風雪—駛離港口的汽船', year: 1842, note: '據說綁上桅杆觀察風暴' },
    ],
  },
  {
    id: 'delacroix', name: '德拉克洛瓦', mono: '德', img: 'assets/char/delacroix.png', medium: '巴洛克與浪漫',
    title: '浪漫旗手', era: '1798 – 1863', origin: '法國・巴黎近郊',
    tags: ['浪漫主義', '色彩', '革命'],
    desc: '法國浪漫主義的統帥。色彩先於線條、激情先於法則,《自由引導人民》高舉三色旗,把繪畫變成整個時代的吶喊。',
    stats: { atk: 9, def: 6, spd: 8, wis: 8 }, difficulty: 3,
    hue: 220, hue2: 0,
    skills: {
      light: { name: '激情色筆', desc: '奔放色彩的斬擊' },
      heavy: { name: '薩丹納帕勒斯之死', desc: '華麗毀滅的暴風' },
      ultra: { name: '自由引導人民', desc: '三色旗起,萬眾衝鋒' },
    },
    works: [
      { title: '自由引導人民', year: 1830, note: '七月革命的精神圖騰' },
      { title: '薩丹納帕勒斯之死', year: 1827, note: '浪漫主義的極致狂想' },
      { title: '巧斯島的屠殺', year: 1824, note: '震動沙龍的控訴之作' },
    ],
  },

  /* ══ 印象與後印象 ══ */
  {
    id: 'millet', name: '米勒', mono: '勒', img: 'assets/char/millet.png', medium: '印象與後印象',
    title: '大地牧歌', era: '1814 – 1875', origin: '法國・諾曼第',
    tags: ['寫實主義', '巴比松', '農民'],
    desc: '巴比松的農民畫家。《拾穗》與《晚禱》讓彎腰的身影有了神聖的重量,大地與勞動在他筆下成為無聲的頌歌,也為印象派鋪出走向自然之路。',
    stats: { atk: 6, def: 9, spd: 6, wis: 9 }, difficulty: 2,
    hue: 45, hue2: 100,
    skills: {
      light: { name: '播種者', desc: '揮臂撒種的大步弧線' },
      heavy: { name: '拾穗', desc: '彎腰大地的沉默之力' },
      ultra: { name: '晚禱', desc: '暮色鐘響,大地俯首' },
    },
    works: [
      { title: '拾穗', year: 1857, note: '農婦拾穗的莊嚴詩篇' },
      { title: '晚禱', year: 1859, note: '暮色中的無聲祈禱' },
      { title: '播種者', year: 1850, note: '大步撒種的勞動英雄' },
    ],
  },
  {
    id: 'courbet', name: '庫爾貝', mono: '庫', img: 'assets/char/courbet.png', medium: '印象與後印象',
    title: '寫實鬥士', era: '1819 – 1877', origin: '法國・奧爾南',
    tags: ['寫實主義', '在野', '勞動'],
    desc: '寫實主義的先鋒鬥士:「給我看一個天使,我就畫一個。」他把石工與平民葬禮畫上歷史畫的尺幅,還在世博會旁自建展館,對抗整個官方沙龍。',
    stats: { atk: 10, def: 7, spd: 6, wis: 7 }, difficulty: 4,
    hue: 100, hue2: 25,
    skills: {
      light: { name: '調色刀', desc: '厚實顏料的直劈' },
      heavy: { name: '採石工人', desc: '勞動重量的一擊' },
      ultra: { name: '奧爾南的葬禮', desc: '巨幅現實,轟然展開' },
    },
    works: [
      { title: '奧爾南的葬禮', year: 1850, note: '顛覆學院的巨幅平民葬禮' },
      { title: '採石工人', year: 1849, note: '寫實主義的勞動宣言' },
      { title: '畫室', year: 1855, note: '自稱「真實的寓言」' },
    ],
  },
  {
    id: 'manet', name: '馬奈', mono: '奈', img: 'assets/char/manet.png', medium: '印象與後印象',
    title: '現代先聲', era: '1832 – 1883', origin: '法國・巴黎',
    tags: ['印象派之父', '沙龍', '現代生活'],
    desc: '從寫實走向印象的關鍵一人。《草地上的午餐》與《奧林匹亞》兩度震撼巴黎;年輕的印象派尊他為精神領袖,他卻終生嚮往官方沙龍的桂冠。',
    stats: { atk: 8, def: 7, spd: 9, wis: 9 }, difficulty: 3,
    hue: 60, hue2: 220,
    skills: {
      light: { name: '平塗黑', desc: '優雅銳利的黑色塊' },
      heavy: { name: '奧林匹亞', desc: '直視觀者的挑釁' },
      ultra: { name: '草地上的午餐', desc: '驚世野餐,輿論炸裂' },
    },
    works: [
      { title: '草地上的午餐', year: 1863, note: '落選者沙龍的世紀醜聞' },
      { title: '奧林匹亞', year: 1863, note: '直視時代的裸女' },
      { title: '女神遊樂廳的吧檯', year: 1882, note: '鏡像謎題的絕唱' },
    ],
  },
  {
    id: 'monet', name: '莫內', mono: '莫', img: 'assets/char/monet.png', medium: '印象與後印象',
    title: '自然光法師', era: '1840 – 1926', origin: '法國・巴黎',
    tags: ['印象派', '睡蓮', '吉維尼'],
    desc: '印象派命名之作《印象・日出》的作者。畢生追逐光與色的瞬間變化,晚年在吉維尼的花園裡,把滿池睡蓮畫成無邊無際的光之交響。',
    stats: { atk: 7, def: 7, spd: 9, wis: 8 }, difficulty: 2,
    hue: 200, hue2: 150,
    skills: {
      light: { name: '印象筆觸', desc: '捕捉瞬間的碎光連點' },
      heavy: { name: '盧昂大教堂', desc: '同一座教堂,千變的光' },
      ultra: { name: '睡蓮・光之池', desc: '水面綻放,包圍全場' },
    },
    works: [
      { title: '印象・日出', year: 1872, note: '為整個畫派命名之作' },
      { title: '睡蓮系列', year: 1916, note: '橘園美術館的環形巨作' },
      { title: '乾草堆系列', year: 1891, note: '光的連作實驗' },
    ],
  },
  {
    id: 'renoir', name: '雷諾瓦', mono: '雷', img: 'assets/char/renoir.png', medium: '印象與後印象',
    title: '歡愉舞者', era: '1841 – 1919', origin: '法國・利摩日',
    tags: ['印象派', '人物', '幸福'],
    desc: '最擅長畫幸福的印象派畫家,《煎餅磨坊的舞會》灑滿樹隙間的陽光。晚年類風濕性關節炎令手指變形,仍把畫筆綁在手上繼續作畫。',
    stats: { atk: 6, def: 8, spd: 8, wis: 8 }, difficulty: 2,
    hue: 330, hue2: 45,
    skills: {
      light: { name: '玫瑰色點染', desc: '溫暖膚色的柔光連擊' },
      heavy: { name: '船上的午宴', desc: '歡宴光影的痛快一擊' },
      ultra: { name: '煎餅磨坊的舞會', desc: '滿場舞影與陽光傾瀉' },
    },
    works: [
      { title: '煎餅磨坊的舞會', year: 1876, note: '奧塞美術館的印象派經典' },
      { title: '船上的午宴', year: 1881, note: '友人歡聚的光之盛宴' },
      { title: '彈鋼琴的少女', year: 1892, note: '溫柔的家庭題材' },
    ],
  },
  {
    id: 'degas', name: '竇加', mono: '竇', img: 'assets/char/degas.png', medium: '印象與後印象',
    title: '舞台捕手', era: '1834 – 1917', origin: '法國・巴黎',
    tags: ['印象派', '芭蕾', '粉彩'],
    desc: '以芭蕾舞者聞名的巴黎觀察者。用粉彩捕捉排練室與舞台側翼的瞬間動態,晚年視力衰退便改捏雕塑,自稱是「寫實主義者」的印象派異端。',
    stats: { atk: 7, def: 7, spd: 10, wis: 8 }, difficulty: 3,
    hue: 170, hue2: 320,
    skills: {
      light: { name: '側翼速寫', desc: '出其不意的視角突襲' },
      heavy: { name: '舞蹈課', desc: '旋轉舞步的連續打擊' },
      ultra: { name: '十四歲的小舞者', desc: '青銅少女躍出展櫃' },
    },
    works: [
      { title: '舞蹈課', year: 1874, note: '芭蕾題材代表作' },
      { title: '十四歲的小舞者', year: 1881, note: '穿著真紗裙的雕塑' },
      { title: '苦艾酒', year: 1876, note: '都會孤寂的寫照' },
    ],
  },
  {
    id: 'cezanne', name: '塞尚', mono: '尚', img: 'assets/char/cezanne.png', medium: '印象與後印象',
    title: '結構賢者', era: '1839 – 1906', origin: '法國・艾克斯',
    tags: ['後印象派', '現代藝術之父', '蘋果'],
    desc: '「要用圓柱、圓球、圓錐處理自然。」他以一顆蘋果震撼巴黎,反覆描繪家鄉的聖維克多山,為立體派鋪路,被尊為現代藝術之父。',
    stats: { atk: 7, def: 10, spd: 5, wis: 10 }, difficulty: 4,
    hue: 120, hue2: 30,
    skills: {
      light: { name: '幾何筆觸', desc: '塊面堆疊的理性突刺' },
      heavy: { name: '蘋果靜物', desc: '一顆蘋果的絕對重量' },
      ultra: { name: '聖維克多山', desc: '山體解構,大地重組' },
    },
    works: [
      { title: '聖維克多山系列', year: 1904, note: '畢生反覆探索的母題' },
      { title: '玩紙牌的人', year: 1893, note: '曾創世界最高價名畫紀錄' },
      { title: '蘋果籃靜物', year: 1893, note: '顛覆透視的靜物' },
    ],
  },
  {
    id: 'vangogh', name: '梵谷', mono: '梵', img: 'assets/char/vangogh.png', medium: '印象與後印象',
    title: '星空魔導士', era: '1853 – 1890', origin: '荷蘭・津德爾特',
    tags: ['後印象派', '星夜', '向日葵'],
    desc: '燃燒生命作畫的傳道士之子。厚塗筆觸捲起星空旋渦,向日葵是他對南法陽光的告白;生前只賣出一幅畫,如今卻照亮全世界。',
    stats: { atk: 10, def: 4, spd: 9, wis: 7 }, difficulty: 4,
    hue: 50, hue2: 220,
    skills: {
      light: { name: '厚塗筆觸', desc: '油彩堆疊的火燙連擊' },
      heavy: { name: '向日葵爆炸', desc: '金黃花束的烈焰' },
      ultra: { name: '星夜', desc: '星空旋渦吞沒天地' },
    },
    works: [
      { title: '星夜', year: 1889, note: '紐約現代藝術博物館鎮館' },
      { title: '向日葵', year: 1888, note: '阿爾勒時期的陽光連作' },
      { title: '麥田群鴉', year: 1890, note: '最後時期的悲愴之作' },
    ],
  },
  {
    id: 'gauguin', name: '高更', mono: '更', img: 'assets/char/gauguin.png', medium: '印象與後印象',
    title: '大溪地祭司', era: '1848 – 1903', origin: '法國・巴黎',
    tags: ['後印象派', '大溪地', '象徵'],
    desc: '拋下證券經紀人的安穩人生,遠走大溪地尋找原始樂園。以平塗色塊與象徵手法追問:我們從哪裡來?我們是誰?我們往哪裡去?',
    stats: { atk: 8, def: 7, spd: 6, wis: 9 }, difficulty: 4,
    hue: 20, hue2: 300,
    skills: {
      light: { name: '象徵色塊', desc: '神祕平塗的色面攻擊' },
      heavy: { name: '黃色基督', desc: '信仰與色彩的重擊' },
      ultra: { name: '我們從哪裡來', desc: '生命長卷徐徐展開' },
    },
    works: [
      { title: '我們從哪裡來?我們是誰?我們往哪裡去?', year: 1897, note: '大溪地時期的哲學鉅作' },
      { title: '黃色基督', year: 1889, note: '綜合主義代表作' },
      { title: '沙灘上的大溪地女人', year: 1891, note: '南島樂園系列' },
    ],
  },

  /* ══ 現代藝術革命 ══ */
  {
    id: 'munch', name: '孟克', mono: '孟', img: 'assets/char/munch.png', medium: '現代藝術革命',
    title: '吶喊先知', era: '1863 – 1944', origin: '挪威・洛滕',
    tags: ['表現主義', '吶喊', '焦慮'],
    desc: '挪威表現主義先驅。童年的病與死在他心中留下陰影,他把焦慮畫成血色天空下的吶喊,讓「情緒」本身第一次成為繪畫的主角。',
    stats: { atk: 9, def: 5, spd: 8, wis: 7 }, difficulty: 3,
    hue: 15, hue2: 260,
    skills: {
      light: { name: '焦慮線條', desc: '扭曲波動的精神攻擊' },
      heavy: { name: '生命之舞', desc: '命運迴旋的重壓' },
      ultra: { name: '吶喊', desc: '血色天空下的無聲尖叫' },
    },
    works: [
      { title: '吶喊', year: 1893, note: '共四個版本傳世' },
      { title: '病中的孩子', year: 1886, note: '童年傷痛的告白' },
      { title: '生命之舞', year: 1900, note: '生命循環的寓言' },
    ],
  },
  {
    id: 'matisse', name: '馬諦斯', mono: '馬', img: 'assets/char/matisse.png', medium: '現代藝術革命',
    title: '野獸色王', era: '1869 – 1954', origin: '法國・勒卡托',
    tags: ['野獸派', '剪紙', '色彩解放'],
    desc: '野獸派掌門,把色彩從「描寫」中徹底解放。晚年臥病改持剪刀「用剪刀作畫」,剪出最自由的藍與金,與畢卡索惺惺相惜一生。',
    stats: { atk: 9, def: 6, spd: 8, wis: 8 }, difficulty: 2,
    hue: 210, hue2: 0,
    skills: {
      light: { name: '純色平塗', desc: '高彩度色面的直擊' },
      heavy: { name: '舞蹈', desc: '紅色人環的旋轉衝擊' },
      ultra: { name: '剪刀之舞・藍色裸女', desc: '剪紙飛舞,色彩解放' },
    },
    works: [
      { title: '戴帽子的女人', year: 1905, note: '野獸派的驚世之作' },
      { title: '舞蹈', year: 1910, note: '紅色人環的原始節奏' },
      { title: '藍色裸女剪紙', year: 1952, note: '晚年剪紙系列' },
    ],
  },
  {
    id: 'picasso', name: '畢卡索', mono: '畢', img: 'assets/char/picasso.png', medium: '現代藝術革命',
    title: '空間操控者', era: '1881 – 1973', origin: '西班牙・馬拉加',
    tags: ['立體派', '格爾尼卡', '千面'],
    desc: '二十世紀藝術的代名詞。與布拉克共創立體派,把物體拆解重組;《格爾尼卡》以黑白怒吼控訴戰爭;一生創作數萬件,風格千變萬化。',
    stats: { atk: 9, def: 7, spd: 9, wis: 9 }, difficulty: 3,
    hue: 220, hue2: 0,
    skills: {
      light: { name: '藍色時期', desc: '憂鬱藍調的冷冽突刺' },
      heavy: { name: '亞維儂的少女', desc: '五位少女撕裂空間' },
      ultra: { name: '格爾尼卡', desc: '黑白巨牆轟然壓下' },
    },
    works: [
      { title: '亞維儂的少女', year: 1907, note: '立體派的開山之作' },
      { title: '格爾尼卡', year: 1937, note: '控訴轟炸的世紀壁畫' },
      { title: '夢', year: 1932, note: '金髮繆思的柔軟肖像' },
    ],
  },
  {
    id: 'kandinsky', name: '康丁斯基', mono: '康', img: 'assets/char/kandinsky.png', medium: '現代藝術革命',
    title: '抽象樂師', era: '1866 – 1944', origin: '俄羅斯・莫斯科',
    tags: ['抽象先驅', '藍騎士', '包浩斯'],
    desc: '聽得見色彩的通感者,抽象繪畫的先驅。與馬爾克共組「藍騎士」,任教包浩斯,寫下《藝術中的精神》,讓點、線、面像交響樂一樣演奏。',
    stats: { atk: 7, def: 7, spd: 8, wis: 10 }, difficulty: 4,
    hue: 250, hue2: 60,
    skills: {
      light: { name: '點・線・面', desc: '幾何元素的精準齊射' },
      heavy: { name: '構成第八號', desc: '幾何音符的齊奏' },
      ultra: { name: '即興交響', desc: '色彩化為音樂風暴' },
    },
    works: [
      { title: '構成第七號', year: 1913, note: '抽象繪畫的巔峰巨構' },
      { title: '即興系列', year: 1912, note: '音樂性的色彩實驗' },
      { title: '藍騎士年鑑', year: 1912, note: '與馬爾克共同創立' },
    ],
  },
  {
    id: 'dali', name: '達利', mono: '利', img: 'assets/char/dali.png', medium: '現代藝術革命',
    title: '夢境召喚師', era: '1904 – 1989', origin: '西班牙・菲格雷斯',
    tags: ['超現實', '融化時鐘', '翹鬍子'],
    desc: '翹鬍子的超現實主義狂想家。以自創的「偏執狂批判法」把夢境畫得比照片更真實,融化的時鐘讓時間永遠柔軟,連人生本身都是他的作品。',
    stats: { atk: 8, def: 6, spd: 9, wis: 9 }, difficulty: 3,
    hue: 45, hue2: 280,
    skills: {
      light: { name: '夢境滲透', desc: '潛意識的詭譎侵蝕' },
      heavy: { name: '內戰的預感', desc: '夢魘巨軀的撕扯' },
      ultra: { name: '記憶的堅持', desc: '時鐘融化,時間扭曲' },
    },
    works: [
      { title: '記憶的堅持', year: 1931, note: '融化時鐘的代名詞' },
      { title: '內戰的預感', year: 1936, note: '西班牙內戰的夢魘' },
      { title: '聖十字若望的基督', year: 1951, note: '俯瞰視角的神聖' },
    ],
  },
  {
    id: 'kahlo', name: '芙烈達', mono: '芙', img: 'assets/char/kahlo.png', medium: '現代藝術革命',
    title: '荊棘女王', era: '1907 – 1954', origin: '墨西哥・科約阿坎',
    tags: ['自畫像', '墨西哥', '不屈'],
    desc: '墨西哥的傳奇女畫家。18 歲的公車車禍粉碎了她的身體,她便在病床上開始作畫,以一幅幅自畫像直視痛苦:「我畫自己,因為我最了解自己。」',
    stats: { atk: 8, def: 9, spd: 6, wis: 9 }, difficulty: 3,
    hue: 130, hue2: 350,
    skills: {
      light: { name: '荊棘之刺', desc: '纏繞頸間的尖刺反擊' },
      heavy: { name: '兩個芙烈達', desc: '雙生心臟的共鳴' },
      ultra: { name: '破碎的圓柱', desc: '鋼釘與淚水,不屈綻放' },
    },
    works: [
      { title: '兩個芙烈達', year: 1939, note: '雙重自我的對望' },
      { title: '戴荊棘項鍊的自畫像', year: 1940, note: '最著名的自畫像之一' },
      { title: '破碎的圓柱', year: 1944, note: '傷痛與意志的告白' },
    ],
  },
  {
    id: 'pollock', name: '波洛克', mono: '洛', img: 'assets/char/pollock.png', medium: '現代藝術革命',
    title: '滴彩狂戰士', era: '1912 – 1956', origin: '美國・懷俄明',
    tags: ['抽象表現', '行動繪畫', '滴畫'],
    desc: '把畫布鋪在地上,用滴、灑、甩作畫的「行動繪畫」旗手。他讓繪畫成為身體的舞蹈,也讓紐約取代巴黎,成為戰後世界藝術之都。',
    stats: { atk: 10, def: 5, spd: 9, wis: 6 }, difficulty: 4,
    hue: 30, hue2: 200,
    skills: {
      light: { name: '甩彩飛沫', desc: '四濺顏料的亂舞' },
      heavy: { name: '秋韻', desc: '顏料罐傾天而下' },
      ultra: { name: '滴彩風暴', desc: '全畫布轟炸,線條奔流' },
    },
    works: [
      { title: '第5號,1948', year: 1948, note: '曾創天價紀錄的滴畫' },
      { title: '秋韻:第30號', year: 1950, note: '行動繪畫代表作' },
      { title: '壁畫', year: 1943, note: '佩姬・古根漢委託的突破之作' },
    ],
  },
  {
    id: 'warhol', name: '沃荷', mono: '沃', img: 'assets/char/warhol.png', medium: '現代藝術革命',
    title: '普普藝術王', era: '1928 – 1987', origin: '美國・匹茲堡',
    tags: ['普普藝術', '絹印', '工廠'],
    desc: '普普藝術之王。把湯罐頭與瑪麗蓮夢露印上畫布,在銀色「工廠」裡量產藝術,預言「未來人人都能成名十五分鐘」。',
    stats: { atk: 8, def: 7, spd: 9, wis: 8 }, difficulty: 2,
    hue: 300, hue2: 60,
    skills: {
      light: { name: '絹印連打', desc: '複製再複製的網版快攻' },
      heavy: { name: '康寶湯罐頭', desc: '罐頭矩陣的轟炸' },
      ultra: { name: '普普爆炸・金色瑪麗蓮', desc: '霓虹網點吞沒世界' },
    },
    works: [
      { title: '康寶濃湯罐頭', year: 1962, note: '32 罐改變藝術史' },
      { title: '瑪麗蓮・夢露絹印', year: 1962, note: '普普偶像的誕生' },
      { title: '銀色工廠', year: 1964, note: '紐約的傳奇工作室' },
    ],
  },
  {
    id: 'klimt', name: '克林姆', mono: '克', img: 'assets/char/klimt.png', medium: '現代藝術革命',
    title: '黃金裝飾師', era: '1862 – 1918', origin: '奧地利・維也納',
    tags: ['維也納分離派', '金箔', '新藝術'],
    desc: '維也納分離派的領袖。把金箔貼上畫布,讓愛與生命在裝飾紋樣中閃耀;《吻》是世上最華麗的擁抱,也是新藝術運動的極致。',
    stats: { atk: 8, def: 7, spd: 7, wis: 9 }, difficulty: 3,
    hue: 45, hue2: 25,
    skills: {
      light: { name: '金箔流紋', desc: '螺旋紋樣的炫目連擊' },
      heavy: { name: '生命之樹', desc: '金色枝椏纏繞全場' },
      ultra: { name: '吻・黃金擁抱', desc: '金光滿溢,萬物臣服' },
    },
    works: [
      { title: '吻', year: 1908, note: '維也納美景宮鎮館之寶' },
      { title: '阿黛爾肖像一號', year: 1907, note: '「黃金女士」,曾創拍賣天價' },
      { title: '貝多芬橫飾帶', year: 1902, note: '分離派會館的壁畫鉅作' },
    ],
  },
];

/* BOSS:空白畫布 */
const BOSS_CHAR = {
  id: 'boss-blank', name: '空白畫布', mono: '白',
  title: '吞噬色彩的虛無', era: '???', origin: '未完成的畫框',
  tags: ['BOSS', '虛無', '漂白'],
  desc: '從所有被放棄的畫作中誕生的虛無之獸,將世上的色彩與記憶一寸寸漂白。唯有以藝術史的知識重新上色,才能將它封印回畫框深處。',
  stats: { atk: 10, def: 10, spd: 8, wis: 10 }, difficulty: 5,
  hue: 220, hue2: 260,
  skills: {
    light: { name: '留白侵蝕', desc: '' },
    heavy: { name: '顏料剝落', desc: '' },
    ultra: { name: '全面漂白', desc: '' },
  },
  works: [],
};

/* CSV 欄位順序(教師模式匯入/匯出) */
const CSV_HEADER = ['題目', '選項A', '選項B', '選項C', '選項D', '答案(A-D)', '難度(1-3)', '分類', '解說'];

/* AI 難度設定 */
const AI_LEVELS = [
  { id: 'easy',   name: 'Easy',   label: '學徒',    acc: 0.42, thinkMin: 2.2, thinkMax: 4.5, ultraUse: 0.3 },
  { id: 'normal', name: 'Normal', label: '鑑賞家',  acc: 0.60, thinkMin: 1.8, thinkMax: 3.8, ultraUse: 0.6 },
  { id: 'hard',   name: 'Hard',   label: '策展人',  acc: 0.74, thinkMin: 1.4, thinkMax: 3.0, ultraUse: 0.8 },
  { id: 'expert', name: 'Expert', label: '大師',    acc: 0.86, thinkMin: 1.0, thinkMax: 2.4, ultraUse: 0.95 },
  { id: 'master', name: 'Master', label: '藝術之神', acc: 0.94, thinkMin: 0.8, thinkMax: 1.8, ultraUse: 1 },
];

/* 流派分組(選角與圖鑑的分組順序,同時也是相剋屬性) */
const MEDIUMS = ['文藝復興', '巴洛克與浪漫', '印象與後印象', '現代藝術革命'];

/* 遊戲模式定義 */
const MODES = [
  { id: 'solo',     icon: '⚔', name: '單人決鬥', desc: '與 AI 藝術家一對一知識對決', ready: true },
  { id: 'versus',   icon: '⚡', name: '雙人對戰', desc: '同機雙人,輪流答題一決高下', ready: true },
  { id: 'practice', icon: '🏛', name: '美術館修練', desc: '無勝負壓力,自由刷題漫遊藝術史', ready: true },
  { id: 'survival', icon: '🔥', name: '生存遠征', desc: '連續迎戰逐漸變強的藝術大師', ready: true },
  { id: 'boss',     icon: '👹', name: 'BOSS 戰', desc: '討伐吞噬色彩的「空白畫布」', ready: true },
  { id: 'teacher',  icon: '🎓', name: '教師模式', desc: '建立題庫、CSV 匯入、課堂應用', ready: true },
  { id: 'gallery',  icon: '🖼', name: '英雄圖鑑', desc: '瀏覽藝術家生平與解鎖名作', ready: true },
  { id: 'story',    icon: '🗺', name: '故事模式', desc: '沿藝術史年代逐關挑戰(開發中)', ready: false },
  { id: 'museum',   icon: '🏺', name: '作品辨識', desc: '看圖辨名作的博物館挑戰(開發中)', ready: false },
];
