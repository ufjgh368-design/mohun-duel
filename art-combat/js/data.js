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
      { title: '斯克羅威尼禮拜堂壁畫', year: 1305, note: '帕多瓦的濕壁畫鉅作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Padova%20Cappella%20degli%20Scrovegni%20Innen%20Langhaus%20West%205.jpg' },
      { title: '猶大之吻', year: 1305, note: '戲劇性的對峙瞬間', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Giotto%20-%20Scrovegni%20-%20-31-%20-%20Kiss%20of%20Judas.jpg' },
      { title: '聖方濟接受聖痕', year: 1295, note: '阿西西傳說系列', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Giotto%20-%20Saint%20Francis%20Receiving%20the%20Stigmata.jpg' },
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
      { title: '青銅大衛', year: 1440, note: '文藝復興雕塑的里程碑', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Florence%20-%20David%20by%20Donatello.jpg' },
      { title: '加塔梅拉塔騎馬像', year: 1453, note: '帕多瓦的傭兵隊長', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gattamelata.jpg' },
      { title: '聖喬治', year: 1417, note: '佛羅倫斯行會壁龕之作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/St.%20Georg%2C%20Donatello%2C%201416-17%2C%20Bargello%20Florenz-01.jpg' },
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
      { title: '根特祭壇畫', year: 1432, note: '北方文藝復興的里程碑', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lamgods%20open.jpg' },
      { title: '阿諾菲尼夫婦', year: 1434, note: '凸面鏡與「范艾克在此」', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Van%20Eyck%20-%20Arnolfini%20Portrait.jpg' },
      { title: '包紅頭巾的男子', year: 1433, note: '疑似畫家自畫像', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Portrait%20of%20a%20Man%20in%20a%20red%20turban%20%28by%20Jan%20van%20Eyck%29.jpg' },
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
      { title: '春', year: 1482, note: '維納斯花園中的神話群像', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sandro%20Botticelli%20-%20La%20Primavera%20-%20Google%20Art%20Project.jpg' },
      { title: '維納斯的誕生', year: 1485, note: '文藝復興最著名的神話畫', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sandro%20Botticelli%20-%20La%20nascita%20di%20Venere%20-%20Google%20Art%20Project%20-%20edited.jpg' },
      { title: '誹謗', year: 1495, note: '晚期的寓意告白', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sandro%20Botticelli%20La%20calumnia%20de%20Apeles.jpg' },
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
      { title: '蒙娜麗莎', year: 1503, note: '羅浮宮鎮館之寶', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mona%20Lisa%2C%20by%20Leonardo%20da%20Vinci%2C%20from%20C2RMF%20retouched.jpg' },
      { title: '最後的晚餐', year: 1498, note: '米蘭恩寵聖母修道院壁畫', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Leonardo%20da%20Vinci%20%281452-1519%29%20-%20The%20Last%20Supper%20%281495-1498%29.jpg' },
      { title: '維特魯威人', year: 1490, note: '人體比例的傳世素描', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Da%20Vinci%20Vitruve%20Luc%20Viatour.jpg' },
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
      { title: '聖殤', year: 1499, note: '聖彼得大教堂的悲憫之作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Michelangelo%27s%20Piet%C3%A0%20Saint%20Peter%27s%20Basilica%20Vatican%20City.jpg' },
      { title: '大衛像', year: 1504, note: '佛羅倫斯學院美術館鎮館', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Michelangelo%27s%20David%20-%20right%20view%202.jpg' },
      { title: '創世紀天頂畫', year: 1512, note: '西斯汀禮拜堂的曠世穹頂', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sistine%20Chapel%20ceiling%2002.jpg' },
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
      { title: '雅典學院', year: 1511, note: '梵蒂岡簽字廳壁畫', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/%22The%20School%20of%20Athens%22%20by%20Raffaello%20Sanzio%20da%20Urbino.jpg' },
      { title: '西斯汀聖母', year: 1512, note: '畫底兩位小天使聞名於世', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Raphael%20-%20The%20Sistine%20Madonna%20-%20Google%20Art%20Project.jpg' },
      { title: '草地上的聖母', year: 1506, note: '聖母像的溫柔典範', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Raphael%20-%20Madonna%20in%20the%20Meadow%20-%20Google%20Art%20Project.jpg' },
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
      { title: '聖母升天', year: 1518, note: '威尼斯榮耀聖母教堂祭壇畫', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tizian%20041.jpg' },
      { title: '烏爾比諾的維納斯', year: 1538, note: '斜臥維納斯的經典', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Tiziano%20-%20Venere%20di%20Urbino%20-%20Google%20Art%20Project.jpg' },
      { title: '酒神與亞里阿德涅', year: 1523, note: '神話色彩的鉅作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Titian%20Bacchus%20and%20Ariadne.jpg' },
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
      { title: '聖馬太蒙召', year: 1600, note: '戲劇性光線的代表作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Caravaggio%2C%20Michelangelo%20Merisi%20da%20-%20The%20Calling%20of%20Saint%20Matthew%20-%201599-1600%20%28hi%20res%29.jpg' },
      { title: '酒神', year: 1596, note: '青年時期的微醺自況', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bacchus%20by%20Caravaggio%201.jpg' },
      { title: '大衛與歌利亞', year: 1610, note: '以自己的臉畫下巨人首級', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/David%20with%20the%20Head%20of%20Goliath-Caravaggio%20%281610%29.jpg' },
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
      { title: '上十字架', year: 1610, note: '安特衛普大教堂祭壇鉅作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Peter%20Paul%20Rubens%20-%20Raising%20of%20the%20Cross%20-%20WGA20204.jpg' },
      { title: '瑪麗・德・美第奇生平組畫', year: 1625, note: '羅浮宮專廳的廿四連作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rubens%20medici%20cycle%20meeting%20at%20Lyon.jpg' },
      { title: '三美神', year: 1635, note: '豐滿人體的頌歌', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Three%20Graces%2C%20by%20Peter%20Paul%20Rubens%2C%20from%20Prado%20in%20Google%20Earth.jpg' },
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
      { title: '宮女', year: 1656, note: '普拉多美術館的鎮館之謎', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Las%20Meninas%2C%20by%20Diego%20Vel%C3%A1zquez%2C%20from%20Prado%20in%20Google%20Earth.jpg' },
      { title: '教宗英諾森十世肖像', year: 1650, note: '教宗驚呼「太真實了」', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Portrait%20of%20Innocentius%20X%20by%20Diego%20Vel%C3%A1zquez%20in%20Galleria%20Doria%20Pamphilj%20%28Rome%29.jpg' },
      { title: '布雷達之降', year: 1635, note: '歷史畫裡的人性時刻', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Velazquez-The%20Surrender%20of%20Breda.jpg' },
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
      { title: '夜巡', year: 1642, note: '阿姆斯特丹國家博物館鎮館', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Night%20Watch%20-%20HD.jpg' },
      { title: '杜爾普醫師的解剖課', year: 1632, note: '一舉成名的群像畫', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt%20-%20The%20Anatomy%20Lesson%20of%20Dr%20Nicolaes%20Tulp.jpg' },
      { title: '猶太新娘', year: 1665, note: '梵谷願折十年壽命換兩週凝視的傑作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rembrandt%20Harmensz.%20van%20Rijn%20-%20Portret%20van%20een%20paar%20als%20oudtestamentische%20figuren%2C%20genaamd%20%27Het%20Joodse%20bruidje%27%20-%20Google%20Art%20Project.jpg' },
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
      { title: '戴珍珠耳環的少女', year: 1665, note: '「北方的蒙娜麗莎」', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/1665%20Girl%20with%20a%20Pearl%20Earring.jpg' },
      { title: '倒牛奶的女僕', year: 1658, note: '荷蘭風俗畫經典', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Johannes%20Vermeer%20-%20Het%20melkmeisje%20-%20Google%20Art%20Project.jpg' },
      { title: '臺夫特一景', year: 1661, note: '故鄉上空的天光', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vermeer-view-of-delft.jpg' },
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
      { title: '1808年5月3日', year: 1814, note: '控訴戰爭的不朽之作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/El%20Tres%20de%20Mayo%2C%20by%20Francisco%20de%20Goya%2C%20from%20Prado%20thin%20black%20margin.jpg' },
      { title: '裸體的瑪哈', year: 1800, note: '西班牙繪畫的傳奇', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Goya%20Maja%20naga2.jpg' },
      { title: '農神吞噬其子', year: 1823, note: '黑色繪畫系列', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Francisco%20de%20Goya%2C%20Saturno%20devorando%20a%20su%20hijo%20%281819-1823%29.jpg' },
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
      { title: '被拖去解體的無畏號', year: 1839, note: '英國人票選最愛名畫', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Fighting%20Temeraire%2C%20JMW%20Turner%2C%20National%20Gallery.jpg' },
      { title: '雨、蒸汽和速度', year: 1844, note: '工業時代的光之詩', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rain%20Steam%20and%20Speed%20the%20Great%20Western%20Railway.jpg' },
      { title: '暴風雪—駛離港口的汽船', year: 1842, note: '據說綁上桅杆觀察風暴', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Joseph%20Mallord%20William%20Turner%20-%20Snow%20Storm%20-%20Steam-Boat%20off%20a%20Harbour%27s%20Mouth%20-%20WGA23178.jpg' },
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
      { title: '自由引導人民', year: 1830, note: '七月革命的精神圖騰', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Eug%C3%A8ne%20Delacroix%20-%20Le%2028%20Juillet.%20La%20Libert%C3%A9%20guidant%20le%20peuple.jpg' },
      { title: '薩丹納帕勒斯之死', year: 1827, note: '浪漫主義的極致狂想', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Eug%C3%A8ne%20Delacroix%20-%20La%20Mort%20de%20Sardanapale.jpg' },
      { title: '巧斯島的屠殺', year: 1824, note: '震動沙龍的控訴之作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Sc%C3%A8ne%20des%20massacres%20de%20Scio.jpg' },
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
      { title: '拾穗', year: 1857, note: '農婦拾穗的莊嚴詩篇', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jean-Fran%C3%A7ois%20Millet%20-%20Gleaners%20-%20Google%20Art%20Project%202.jpg' },
      { title: '晚禱', year: 1859, note: '暮色中的無聲祈禱', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jean-Fran%C3%A7ois%20Millet%20-%20The%20Angelus%20-%20Google%20Art%20Project.jpg' },
      { title: '播種者', year: 1850, note: '大步撒種的勞動英雄', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Jean-Fran%C3%A7ois%20Millet%20-%20The%20Sower%20-%20Google%20Art%20Project.jpg' },
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
      { title: '奧爾南的葬禮', year: 1850, note: '顛覆學院的巨幅平民葬禮', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gustave%20Courbet%20-%20A%20Burial%20at%20Ornans%20-%20Google%20Art%20Project%202.jpg' },
      { title: '採石工人', year: 1849, note: '寫實主義的勞動宣言', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gustave%20Courbet%20-%20The%20Stonebreakers%20-%20WGA05457.jpg' },
      { title: '畫室', year: 1855, note: '自稱「真實的寓言」', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Courbet%20LAtelier%20du%20peintre.jpg' },
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
      { title: '草地上的午餐', year: 1863, note: '落選者沙龍的世紀醜聞', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Edouard%20Manet%20-%20Luncheon%20on%20the%20Grass%20-%20Google%20Art%20Project.jpg' },
      { title: '奧林匹亞', year: 1863, note: '直視時代的裸女', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Edouard%20Manet%20-%20Olympia%20-%20Google%20Art%20Project%203.jpg' },
      { title: '女神遊樂廳的吧檯', year: 1882, note: '鏡像謎題的絕唱', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Edouard%20Manet%2C%20A%20Bar%20at%20the%20Folies-Berg%C3%A8re.jpg' },
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
      { title: '印象・日出', year: 1872, note: '為整個畫派命名之作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%2C%20Impression%2C%20soleil%20levant.jpg' },
      { title: '睡蓮', year: 1916, note: '橘園美術館的環形巨作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mus%C3%A9e%20de%20L%27Orangerie%20Water%20Lilies%20Pano%201.jpg' },
      { title: '乾草堆', year: 1891, note: '光的連作實驗', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Claude%20Monet%20-%20Haystacks%2C%20end%20of%20Summer%20-%20Google%20Art%20Project.jpg' },
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
      { title: '煎餅磨坊的舞會', year: 1876, note: '奧塞美術館的印象派經典', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Auguste%20Renoir%20-%20Dance%20at%20Le%20Moulin%20de%20la%20Galette%20-%20Google%20Art%20Project.jpg' },
      { title: '船上的午宴', year: 1881, note: '友人歡聚的光之盛宴', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pierre-Auguste%20Renoir%20-%20Luncheon%20of%20the%20Boating%20Party%20-%20Google%20Art%20Project.jpg' },
      { title: '彈鋼琴的少女', year: 1892, note: '溫柔的家庭題材', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Auguste%20Renoir%20-%20Young%20Girls%20at%20the%20Piano%20-%20Google%20Art%20Project.jpg' },
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
      { title: '舞蹈課', year: 1874, note: '芭蕾題材代表作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Edgar%20Germain%20Hilaire%20Degas%20021.jpg' },
      { title: '十四歲的小舞者', year: 1881, note: '穿著真紗裙的雕塑', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Petite%20danseuse%20de%20quatorze%20ans%2C%201921-1931%20%28cire%20originale%201881%29%2C%20bronze%20patin%C3%A9%2C%20tutu%20en%20tulle%2C%20ruban%20de%20satin%2C%20socle%20en%20bois%2C%20Edgar%20Degas%2C%20Paris%2C%20Mus%C3%A9e%20d%27Orsay%20RF2137%20%281%29.jpg' },
      { title: '苦艾酒', year: 1876, note: '都會孤寂的寫照', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Edgar%20Degas%20-%20In%20a%20Caf%C3%A9%20-%20Google%20Art%20Project%202.jpg' },
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
      { title: '聖維克多山', year: 1904, note: '畢生反覆探索的母題', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Paul%20C%C3%A9zanne%2C%20Mont%20Sainte-Victoire.jpg' },
      { title: '玩紙牌的人', year: 1893, note: '曾創世界最高價名畫紀錄', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Les%20Joueurs%20de%20cartes%2C%20par%20Paul%20C%C3%A9zanne.jpg' },
      { title: '蘋果籃靜物', year: 1893, note: '顛覆透視的靜物', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Paul%20C%C3%A9zanne%20-%20The%20Basket%20of%20Apples%20-%201926.252%20-%20Art%20Institute%20of%20Chicago.jpg' },
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
      { title: '星夜', year: 1889, note: '紐約現代藝術博物館鎮館', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Van%20Gogh%20-%20Starry%20Night%20-%20Google%20Art%20Project.jpg' },
      { title: '向日葵', year: 1888, note: '阿爾勒時期的陽光連作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vincent%20van%20Gogh%20-%20Sunflowers%20%281888%2C%20National%20Gallery%20London%29.jpg' },
      { title: '麥田群鴉', year: 1890, note: '最後時期的悲愴之作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Korenveld%20met%20kraaien%20-%20s0149V1962%20-%20Van%20Gogh%20Museum.jpg' },
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
      { title: '我們從哪裡來?我們是誰?我們往哪裡去?', year: 1897, note: '大溪地時期的哲學鉅作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Paul%20Gauguin%20142.jpg' },
      { title: '黃色基督', year: 1889, note: '綜合主義代表作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gauguin%20Il%20Cristo%20giallo.jpg' },
      { title: '沙灘上的大溪地女人', year: 1891, note: '南島樂園系列', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Paul%20Gauguin%20056.jpg' },
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
      { title: '吶喊', year: 1893, note: '共四個版本傳世', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Edvard%20Munch%20-%20The%20Scream%20-%20Google%20Art%20Project.jpg' },
      { title: '病中的孩子', year: 1886, note: '童年傷痛的告白', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Edvard%20Munch%20-%20The%20Sick%20Child%20I%20-%20Google%20Art%20Project.jpg' },
      { title: '生命之舞', year: 1900, note: '生命循環的寓言', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Edvard%20Munch%20-%20The%20dance%20of%20life%20%281899-1900%29.jpg' },
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
      { title: '戴帽子的女人', year: 1905, note: '野獸派的驚世之作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Matisse-Woman-with-a-Hat.jpg' },
      { title: '舞蹈', year: 1910, note: '紅色人環的原始節奏', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Henri%20Matisse%20-%20Dance%201910.jpg' },
      { title: '藍色裸女剪紙', year: 1952, note: '晚年剪紙系列', img: 'https://en.wikipedia.org/wiki/Special:FilePath/Blue_Nudes_Henri_Matisse.jpg' },
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
      { title: '亞維儂的少女', year: 1907, note: '立體派的開山之作', img: 'https://en.wikipedia.org/wiki/Special:FilePath/Les%20Demoiselles%20d%27Avignon.jpg' },
      { title: '格爾尼卡', year: 1937, note: '控訴轟炸的世紀壁畫', img: 'https://en.wikipedia.org/wiki/Special:FilePath/PicassoGuernica.jpg' },
      { title: '夢', year: 1932, note: '金髮繆思的柔軟肖像', img: 'https://en.wikipedia.org/wiki/Special:FilePath/Le-reve-1932.jpg' },
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
      { title: '構成第七號', year: 1913, note: '抽象繪畫的巔峰巨構', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Composition%20VII%20-%20Wassily%20Kandinsky%2C%20GAC.jpg' },
      { title: '即興第28號', year: 1912, note: '音樂性的色彩實驗', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Vasily%20Kandinsky%20Improvisation%2028%20%28second%20version%29.jpg' },
      { title: '構成第八號', year: 1923, note: '包浩斯時期的幾何交響', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kandinsky%20-%20Composition%208%2C%20July%201923.jpg' },
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
      { title: '記憶的堅持', year: 1931, note: '融化時鐘的代名詞', img: 'https://en.wikipedia.org/wiki/Special:FilePath/The%20Persistence%20of%20Memory.jpg' },
      { title: '內戰的預感', year: 1936, note: '西班牙內戰的夢魘', img: 'https://en.wikipedia.org/wiki/Special:FilePath/SalvadorDali-SoftConstructionWithBeans.jpg' },
      { title: '聖十字若望的基督', year: 1951, note: '俯瞰視角的神聖', img: 'https://en.wikipedia.org/wiki/Special:FilePath/Christ_of_Saint_John_of_the_Cross.jpg' },
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
      { title: '兩個芙烈達', year: 1939, note: '雙重自我的對望', img: 'https://en.wikipedia.org/wiki/Special:FilePath/The%20Two%20Fridas.jpg' },
      { title: '戴荊棘項鍊的自畫像', year: 1940, note: '最著名的自畫像之一', img: 'https://en.wikipedia.org/wiki/Special:FilePath/Frida_Kahlo_%28self_portrait%29.jpg' },
      { title: '破碎的圓柱', year: 1944, note: '傷痛與意志的告白', img: 'https://en.wikipedia.org/wiki/Special:FilePath/The_Broken_Column.jpg' },
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
      { title: '第5號,1948', year: 1948, note: '曾創天價紀錄的滴畫', img: 'https://en.wikipedia.org/wiki/Special:FilePath/No.%205%2C%201948.jpg' },
      { title: '秋韻:第30號', year: 1950, note: '行動繪畫代表作', img: 'https://publicdelivery.org/wp-content/uploads/2021/02/Jackson-Pollock-Autumn-Rhythm-Number-30-1950-enamel-on-canvas-266.7-x-525.8-cm-8-ft.-9-in.-x-17-ft.-3-in.-scaled.jpg' },
      { title: '壁畫', year: 1943, note: '佩姬・古根漢委託的突破之作', img: 'https://en.wikipedia.org/wiki/Special:FilePath/Jackson_Pollock_Mural_1943_Oil_and_casein_on_canvas.jpg' },
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
      { title: '康寶濃湯罐頭', year: 1962, note: '32 罐改變藝術史', img: 'https://en.wikipedia.org/wiki/Special:FilePath/Campbell%27s%20Soup%20Cans%20by%20Andy%20Warhol.jpg' },
      { title: '瑪麗蓮・夢露絹印', year: 1962, note: '普普偶像的誕生', img: 'https://en.wikipedia.org/wiki/Special:FilePath/Marilyndiptych.jpg' },
      { title: '布里洛盒', year: 1964, note: '讓哲學家驚呼「藝術終結」的普普雕塑', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Andy-Warhol-Stockholm-1968.jpg' },
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
      { title: '吻', year: 1908, note: '維也納美景宮鎮館之寶', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/The%20Kiss%20-%20Gustav%20Klimt%20-%20Google%20Cultural%20Institute.jpg' },
      { title: '阿黛爾肖像一號', year: 1907, note: '「黃金女士」,曾創拍賣天價', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Gustav%20Klimt%2C%201907%2C%20Adele%20Bloch-Bauer%20I%2C%20Neue%20Galerie%20New%20York.jpg' },
      { title: '貝多芬橫飾帶', year: 1902, note: '分離派會館的壁畫鉅作', img: 'https://commons.wikimedia.org/wiki/Special:FilePath/Beethovenfries4.jpg' },
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
  { id: 'story',    icon: '🗺', name: '故事模式', desc: '12 關藝術史遠征,直搗空白畫布', ready: true },
  { id: 'museum',   icon: '🏺', name: '作品辨識', desc: '名作鑑定:限時判斷出自誰手', ready: true },
];

/* 故事模式關卡(沿藝術史年代) */
const STORY_STAGES = [
  { ch: '第一章・文藝復興', name: '春之試煉', enemyId: 'botticelli', aiLevel: 'easy',
    intro: '藝術之神引你穿越時空,第一站是佛羅倫斯的春日花園。' },
  { ch: '第一章・文藝復興', name: '聖殿的考驗', enemyId: 'raphael', aiLevel: 'easy',
    intro: '梵蒂岡的迴廊裡,聖殿守護者正等著檢驗你的學識。' },
  { ch: '第一章・文藝復興', name: '萬能天才', enemyId: 'leonardo', aiLevel: 'normal',
    intro: '要走出文藝復興,必須先通過史上最聰明的頭腦。' },
  { ch: '第二章・巴洛克與浪漫', name: '王子的畫室', enemyId: 'rubens', aiLevel: 'normal',
    intro: '安特衛普的大畫室裡,色彩如慶典般翻騰。' },
  { ch: '第二章・巴洛克與浪漫', name: '宮廷之眼', enemyId: 'velazquez', aiLevel: 'normal',
    intro: '馬德里王宮,鏡中的視線正落在你身上。' },
  { ch: '第二章・巴洛克與浪漫', name: '光影宗師', enemyId: 'rembrandt', aiLevel: 'hard',
    intro: '阿姆斯特丹的夜巡開始了,唯有知識能點亮黑暗。' },
  { ch: '第三章・印象與後印象', name: '睡蓮池畔', enemyId: 'monet', aiLevel: 'hard',
    intro: '吉維尼的晨霧散去,光的法師現身池畔。' },
  { ch: '第三章・印象與後印象', name: '結構之山', enemyId: 'cezanne', aiLevel: 'hard',
    intro: '聖維克多山下,現代藝術之父擋住了去路。' },
  { ch: '第三章・印象與後印象', name: '燃燒的星空', enemyId: 'vangogh', aiLevel: 'expert',
    intro: '麥田與星空同時旋轉,接住這份熾熱的靈魂。' },
  { ch: '第四章・現代藝術革命', name: '色彩的野獸', enemyId: 'matisse', aiLevel: 'expert',
    intro: '色彩掙脫了輪廓——野獸派掌門攔路挑戰。' },
  { ch: '第四章・現代藝術革命', name: '千面大師', enemyId: 'picasso', aiLevel: 'master',
    intro: '最後的人類對手,擁有一千張面孔。' },
  { ch: '終章・空白畫布', name: '決戰虛無', enemyId: 'boss-blank', aiLevel: 'master', boss: true,
    intro: '吞噬色彩的虛無現身——以兩千年的藝術史,重新為世界上色!' },
];
