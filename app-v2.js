// ========== 基础时间 ==========
const now = new Date(), hour = now.getHours(), minute = now.getMinutes(), month = now.getMonth() + 1, day = now.getDate();
const weekDay = now.getDay();
const weekCN = ['日','一','二','三','四','五','六'][weekDay];
const timeCN = hour < 6 ? '凌晨' : hour < 11 ? '上午' : hour < 14 ? '中午' : hour < 18 ? '下午' : hour < 22 ? '晚上' : '深夜';
const season = month <= 2 || month === 12 ? '冬' : month <= 5 ? '春' : month <= 8 ? '夏' : '秋';
const weather = ['多云','晴天','阴天','小雨','大风','雾'][Math.floor(Math.random() * 6)];
document.getElementById('sTime').textContent = `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;

// ========== 时段 & 工作日判断 ==========
const isWeekend = weekDay === 0 || weekDay === 6;
const isWorkday = !isWeekend;
const isLateNight = hour >= 22 || hour < 6;
const isMorning = hour >= 6 && hour < 11;
const isNoon = hour >= 11 && hour < 14;
const isAfternoon = hour >= 14 && hour < 18;
const isEvening = hour >= 18 && hour < 22;

// timeFit：内容适合的时段，支持 'any'(全天), 'morning', 'noon', 'afternoon', 'evening', 'latenight', 'workday', 'weekend'
function isTimeFit(fits) {
  if (!fits || !fits.length || fits.includes('any')) return true;
  for (const f of fits) {
    if (f === 'morning' && isMorning) return true;
    if (f === 'noon' && isNoon) return true;
    if (f === 'afternoon' && isAfternoon) return true;
    if (f === 'evening' && isEvening) return true;
    if (f === 'latenight' && isLateNight) return true;
    if (f === 'workday' && isWorkday) return true;
    if (f === 'weekend' && isWeekend) return true;
    if (f === 'daytime' && !isLateNight) return true;
  }
  return false;
}
// 给内容打分：匹配时间段的排前面
function timeScore(fits) {
  if (!fits || !fits.length || fits.includes('any')) return 1;
  return isTimeFit(fits) ? 2 : 0;
}

// ========== 画像数据池 ==========
const POOL = {
  gender: ['男','女'],
  age: ['≤18','19-24','25-30','31-40','41-50','50+'],
  city: [
    {name:'北京·朝阳区',landmarks:['三里屯','CBD','朝阳公园'],alias:'帝都'},
    {name:'上海·浦东',landmarks:['陆家嘴','外滩','黄浦江'],alias:'魔都'},
    {name:'深圳·南山区',landmarks:['深圳湾','科技园','世界之窗'],alias:'鹏城'},
    {name:'广州·天河区',landmarks:['珠江新城','小蛮腰','天河城'],alias:'花城'},
    {name:'杭州·西湖区',landmarks:['西湖','断桥','灵隐寺'],alias:'杭城'},
    {name:'成都·锦江区',landmarks:['春熙路','太古里','锦里'],alias:'蓉城'},
    {name:'武汉·洪山区',landmarks:['武大樱花','黄鹤楼','户部巷'],alias:'江城'},
    {name:'长沙·岳麓区',landmarks:['橘子洲','岳麓山','五一广场'],alias:'星城'},
    {name:'重庆·渝中区',landmarks:['解放碑','洪崖洞','朝天门'],alias:'山城'},
    {name:'南京·玄武区',landmarks:['玄武湖','夫子庙','中山陵'],alias:'金陵'},
    {name:'三亚·海棠湾',landmarks:['亚龙湾','天涯海角','蜈支洲岛'],alias:'鹿城'},
    {name:'西安·碑林区',landmarks:['大雁塔','回民街','兵马俑'],alias:'长安'},
  ],
  job: ['学生','IT互联网','金融','教育','医疗','设计','媒体','自由职业','销售','公务员'],
  crowd: ['学生党','职场白领','IT/程序员','宝妈/宝爸','游戏玩家','追星族','健身达人','科技极客','旅行爱好者','社交达人','内容创作者','二次元人群','考试一族','爱美人群','投资理财人群'],
  formality: ['高度正式','偏正式','日常口语','高度口语化'],
  netSlang: ['重度','中度','轻度','不使用'],
  enMix: ['纯中文','偶尔英文','频繁混用'],
  emotion: ['积极热情型','平和中性型','情绪化型','消极低沉型'],
  emojiLevel: ['重度emoji','中度emoji','轻度emoji','不用emoji'],
  dialect: ['无方言','东北','四川','粤语','北京腔','湖北','湖南','陕西','上海话','南京话','吴语','海南话'],
  app: ['微信','小红书','微博','抖音','钉钉'],
  style: ['简洁明了','口语化','Emoji风','文艺','诗词','创意风格','幽默','治愈温暖','中英混杂','网络黑话','方言','电影/歌词引用','人物模仿','学术严谨','大型颜文字'],
  brevity: ['极简型','正常','长文型'],
  interest: ['美食','旅行','健身','追星','摄影','阅读','游戏','音乐','烘焙','宠物'],
  paragraphStyle: ['连贯叙述','分点列条','短句分段'],
  callStyle: ['亲昵型','正式型','随意型'],
};

const rp = arr => arr[Math.floor(Math.random() * arr.length)];
const pick = (arr, n) => [...arr].sort(() => Math.random() - .5).slice(0, n);
function toast(m) { const t = document.getElementById('toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2000); }

// ========== 城市→方言映射（修复画像不匹配）==========
const CITY_DIALECT_MAP = {
  '北京':'北京腔','广州':'粤语','成都':'四川','重庆':'四川',
  '武汉':'湖北','长沙':'湖南','西安':'陕西','上海':'上海话',
  '南京':'南京话','三亚':'海南话','深圳':'无方言','杭州':'吴语',
};
function getDialectForCity(cityObj) {
  if (!cityObj) return '无方言';
  const cn = cityObj.name.split('·')[0];
  for (const [k, v] of Object.entries(CITY_DIALECT_MAP)) {
    if (cn.includes(k)) return v;
  }
  return '无方言';
}

// ========== 智能语义解析引擎 ==========
// 不再只做粗糙的意图分类，而是深度解析：主题、对象、情绪、场景、关键实体

// 1. 主题识别（用户在说什么事）
const TOPIC_RULES = [
  { topic: '美食', keywords: ['吃','饭','美食','好吃','火锅','奶茶','咖啡','干饭','拉面','烧烤','蛋糕','甜品','冰淇淋','寿司','披萨','串串','麻辣','早餐','午餐','晚餐','夜宵','外卖','做饭','煮','炒','烤','蒸','下厨','食堂','餐厅','面包','粥','饺子','米饭','面条','火锅','烤肉','炸鸡','薯条','汉堡','螺蛳粉','冒菜','酸辣粉','热干面','肠粉','豆浆','包子','馒头','煎饼','点心','糖水','水果','西瓜','草莓','芒果','葡萄','橙子','柠檬','牛排','海鲜','龙虾','大闸蟹','巧克力','奶茶','咖啡','可乐','果汁','啤酒','红酒'] },
  { topic: '工作', keywords: ['加班','打工','上班','摸鱼','996','deadline','甲方','需求','会议','工资','离职','入职','面试','同事','领导','老板','客户','项目','方案','报告','PPT','Excel','邮件','下班','通勤','地铁','公交','办公','工位','打卡','请假','出差','谈判','合同','涨薪','升职','跳槽','KPI','OKR','述职','汇报','改稿','催活','排期'] },
  { topic: '旅行', keywords: ['旅行','旅游','出游','风景','度假','打卡','景点','酒店','民宿','飞机','高铁','火车','自驾','海边','海滩','山','日出','日落','古镇','小巷','博物馆','公园','露营','徒步','爬山','漂流','潜水','滑雪','冲浪'] },
  { topic: '恋爱', keywords: ['恋爱','男朋友','女朋友','对象','表白','爱你','喜欢你','想你','在一起','约会','甜蜜','暧昧','心动','牵手','拥抱','接吻','情侣','老公','老婆','宝贝','亲爱的','纪念日','异地','相亲','暗恋','单身','脱单'] },
  { topic: '健身', keywords: ['健身','运动','跑步','减肥','撸铁','晨跑','瑜伽','游泳','骑行','打球','篮球','足球','羽毛球','乒乓球','网球','keep','马拉松','体重','卡路里','蛋白质','增肌','有氧','无氧','拉伸','核心','腹肌','人鱼线','汗'] },
  { topic: '学习', keywords: ['考试','复习','论文','考研','毕业','大学','高中','学校','课程','老师','教授','图书馆','自习','作业','GPA','四六级','雅思','托福','考公','考编','证书','笔记','背书','刷题','期末','毕设','开题','答辩'] },
  { topic: '宠物', keywords: ['猫','狗','宠物','铲屎官','喵','汪','布偶','英短','金毛','柴犬','柯基','猫粮','狗粮','遛狗','撸猫','小可爱','毛孩子'] },
  { topic: '天气', keywords: ['天气','下雨','晴天','好天气','降温','下雪','阴天','多云','大风','台风','雾','雾霾','热','冷','升温','回暖','换季','春天','夏天','秋天','冬天'] },
  { topic: '读书', keywords: ['读书','看书','书评','小说','作者','文学','读完','好书','书单','书架','纸质书','kindle','图书','翻书','书香'] },
  { topic: '影视', keywords: ['电影','追剧','电视剧','综艺','纪录片','动漫','番剧','影院','上映','主演','导演','剧情','结局','泪目','好看','安利'] },
  { topic: '音乐', keywords: ['歌','音乐','旋律','耳机','听歌','唱歌','KTV','演唱会','专辑','歌词','民谣','摇滚','嘻哈','古典','钢琴','吉他'] },
  { topic: '游戏', keywords: ['游戏','开黑','上分','段位','英雄','皮肤','抽卡','steam','switch','PS5','手游','端游','吃鸡','王者','原神','LOL','电竞','GG'] },
  { topic: '家人', keywords: ['妈妈','爸爸','母亲','父亲','爸','妈','奶奶','爷爷','外公','外婆','姐姐','哥哥','弟弟','妹妹','家人','回家','想家','思念','团圆','家里'] },
  { topic: '友情', keywords: ['朋友','闺蜜','兄弟','死党','发小','老友','好友','友谊','聚会','约饭','一起','多年','好久不见'] },
  { topic: '购物', keywords: ['买','购物','快递','包裹','下单','种草','拔草','打折','优惠','618','双11','剁手','开箱','好物','推荐'] },
  { topic: '摄影', keywords: ['拍照','摄影','相机','镜头','构图','光线','滤镜','修图','照片','自拍','写真','胶片','vlog'] },
  { topic: '穿搭', keywords: ['穿搭','ootd','衣服','裙子','鞋','包','搭配','时尚','潮流','风格','显瘦','好看','新衣'] },
  { topic: '节日', keywords: ['春节','元旦','中秋','端午','情人节','七夕','圣诞','感恩节','万圣节','新年','过年','团年','除夕','国庆','五一','儿童节','母亲节','父亲节','教师节','元宵','清明','重阳'] },
];

// 2. 表达对象识别（对谁说/关于谁）
const TARGET_RULES = [
  { target: '恋人', keywords: ['老公','老婆','男朋友','女朋友','对象','宝贝','亲爱的','爱你','喜欢你','想你','babe','honey','darling'], tone: '甜蜜亲昵' },
  { target: '父母', keywords: ['妈妈','爸爸','母亲','父亲','爸','妈','老妈','老爸','爹','娘'], tone: '温暖感恩' },
  { target: '长辈', keywords: ['奶奶','爷爷','外公','外婆','姥姥','姥爷','叔叔','阿姨','伯伯'], tone: '尊敬温情' },
  { target: '朋友', keywords: ['朋友','闺蜜','兄弟','死党','发小','老友','好友','姐妹','哥们'], tone: '轻松随意' },
  { target: '同事', keywords: ['同事','领导','老板','上司','总监','经理','组长','甲方','客户','合作伙伴'], tone: '得体专业' },
  { target: '老师', keywords: ['老师','教授','导师','班主任','师父','师傅'], tone: '尊敬感谢' },
  { target: '孩子', keywords: ['儿子','女儿','宝宝','孩子','小朋友','闺女','崽','娃'], tone: '温柔慈爱' },
  { target: '自己', keywords: ['自己','我自己','独处','一个人','solo'], tone: '真实坦诚' },
  { target: '陌生人/公众', keywords: ['大家','家人们','宝子们','朋友们','各位','姐妹们','兄弟们','铁子们'], tone: '热情活泼' },
];

// 3. 情绪识别
const EMOTION_RULES = [
  { emotion: '开心', keywords: ['开心','高兴','快乐','太棒了','好开心','哈哈','兴奋','爽','nice','耶','嘿嘿','幸福','满足','心情好','超开心','好嗨','绝了','太好了','太爽了'], valence: 'positive' },
  { emotion: '感动', keywords: ['感动','泪目','暖心','暖暖','温暖','破防','鼻子酸','好感动','太感动','治愈','被治愈'], valence: 'positive' },
  { emotion: '感谢', keywords: ['感谢','谢谢','感恩','多亏','辛苦了','你辛苦了','谢谢你','Thank'], valence: 'positive' },
  { emotion: '期待', keywords: ['期待','好期待','等不及','即将','马上','终于要','盼望','翘首以盼','迫不及待'], valence: 'positive' },
  { emotion: '难过', keywords: ['难过','伤心','心痛','想哭','好难过','崩溃','受不了','心碎','失望','emo','丧','不开心','沮丧','失落','落寞','扎心','心累'], valence: 'negative' },
  { emotion: '累', keywords: ['累','好累','疲惫','扛不住','撑不住','心累','身心俱疲','倦了','精疲力竭','不想动'], valence: 'negative' },
  { emotion: '焦虑', keywords: ['焦虑','压力','紧张','担心','害怕','不安','忐忑','慌','烦躁','烦','头大','头秃','秃了'], valence: 'negative' },
  { emotion: '思念', keywords: ['想你','想念','思念','好久不见','想家','牵挂','想见','好想'], valence: 'neutral' },
  { emotion: '无聊', keywords: ['无聊','好无聊','没意思','闲','没事做','发呆','摸鱼','划水','摆烂'], valence: 'neutral' },
  { emotion: '生气', keywords: ['生气','气死','愤怒','烦死','恼火','不爽','讨厌','恶心','受够了'], valence: 'negative' },
  { emotion: '纠结', keywords: ['纠结','犹豫','选择困难','不知道','该不该','两难','矛盾','到底'], valence: 'neutral' },
  { emotion: '惊喜', keywords: ['惊喜','没想到','意外','居然','竟然','天哪','我的天','不敢相信','哇','wow'], valence: 'positive' },
  { emotion: '释然', keywords: ['释然','放下','算了','无所谓','看开','看淡','随缘','都好','接受'], valence: 'neutral' },
  { emotion: '骄傲', keywords: ['骄傲','自豪','厉害','牛','太强了','佩服','nb','666','膜拜'], valence: 'positive' },
];

// 4. 场景识别
const SCENE_RULES = [
  { scene: '早晨起床', keywords: ['早安','早上好','morning','起床','闹钟','醒来','清晨','早起'] },
  { scene: '睡前', keywords: ['晚安','good night','睡觉','失眠','睡不着','关灯','入睡','熬夜'] },
  { scene: '吃饭', keywords: ['吃饭','干饭','早餐','午餐','晚餐','夜宵','下午茶','餐厅','食堂','外卖','点餐','做饭','下厨'] },
  { scene: '上班途中', keywords: ['通勤','地铁','公交','堵车','早高峰','挤地铁','打车'] },
  { scene: '在公司', keywords: ['办公','工位','会议室','开会','加班','上班','打卡','摸鱼','下班'] },
  { scene: '在家', keywords: ['在家','宅','沙发','躺','被窝','阳台','窗台','客厅','厨房'] },
  { scene: '旅途中', keywords: ['在路上','飞机','火车','高铁','自驾','景区','酒店','民宿','机场','车站'] },
  { scene: '运动中', keywords: ['跑步','健身房','操场','游泳池','球场','瑜伽','骑行','爬山'] },
  { scene: '和人聚会', keywords: ['聚会','聚餐','约饭','KTV','派对','团建','见面','相聚'] },
  { scene: '独处', keywords: ['一个人','独处','安静','发呆','自己待','solo'] },
  { scene: '生日', keywords: ['生日','birthday','生快','蛋糕','蜡烛','许愿','生日快乐'] },
  { scene: '考试/学习', keywords: ['考试','自习','图书馆','复习','备考','做题','写论文'] },
];

// 5. 实体提取（提取用户输入中的关键名词/实体）
function extractEntities(text) {
  const entities = { food: [], place: [], person: [], thing: [], activity: [], time: [] };
  // 食物
  const foods = ['拉面','火锅','奶茶','咖啡','蛋糕','冰淇淋','烧烤','寿司','披萨','串串','螺蛳粉','冒菜','酸辣粉','热干面','肠粉','煎饼','包子','饺子','面条','米饭','牛排','海鲜','龙虾','大闸蟹','巧克力','可乐','果汁','啤酒','红酒','西瓜','草莓','芒果','葡萄','炸鸡','薯条','汉堡','甜品','粥','面包','豆浆','糖水','麻辣烫','冰美式','拿铁','卡布奇诺','抹茶','珍珠奶茶','冰激凌','烤鸭','小龙虾','烤鱼','酸菜鱼','重庆火锅','涮羊肉','烤串','豆花','盖碗茶','鸡蛋灌饼','凉皮','肉夹馍','豆腐脑','蛋炒饭','炒面','锅贴','春卷','粽子','月饼','汤圆','腊肉','腊肠','年糕','青团'];
  foods.forEach(f => { if (text.includes(f)) entities.food.push(f); });
  // 活动
  const activities = ['跑步','游泳','瑜伽','骑行','打球','爬山','露营','潜水','滑雪','冲浪','看电影','追剧','读书','看书','打游戏','开黑','唱歌','画画','拍照','逛街','散步','遛狗','撸猫','做饭','旅行','写代码','刷题','健身','撸铁','拉伸','冥想','听歌','弹琴','弹吉他'];
  activities.forEach(a => { if (text.includes(a)) entities.activity.push(a); });
  // 时间
  const times = ['今天','昨天','明天','周末','上午','下午','晚上','凌晨','中午','傍晚','清晨','深夜','刚才','刚刚','现在'];
  times.forEach(t => { if (text.includes(t)) entities.time.push(t); });
  return entities;
}

// 综合解析函数
function analyzeInput(text) {
  const t = text.toLowerCase();
  // 识别主题（可能有多个）
  const topics = [];
  for (const rule of TOPIC_RULES) {
    const matchCount = rule.keywords.filter(kw => t.includes(kw)).length;
    if (matchCount > 0) topics.push({ topic: rule.topic, strength: matchCount });
  }
  topics.sort((a, b) => b.strength - a.strength);
  const primaryTopic = topics.length > 0 ? topics[0].topic : null;
  const secondaryTopic = topics.length > 1 ? topics[1].topic : null;

  // 识别表达对象
  let target = null, targetTone = '自然随意';
  for (const rule of TARGET_RULES) {
    if (rule.keywords.some(kw => t.includes(kw))) { target = rule.target; targetTone = rule.tone; break; }
  }

  // 识别情绪（可能有多个，取最强的）
  const emotions = [];
  for (const rule of EMOTION_RULES) {
    const matchCount = rule.keywords.filter(kw => t.includes(kw)).length;
    if (matchCount > 0) emotions.push({ emotion: rule.emotion, valence: rule.valence, strength: matchCount });
  }
  emotions.sort((a, b) => b.strength - a.strength);
  const primaryEmotion = emotions.length > 0 ? emotions[0] : { emotion: '平静', valence: 'neutral', strength: 0 };

  // 识别场景
  let scene = null;
  for (const rule of SCENE_RULES) {
    if (rule.keywords.some(kw => t.includes(kw))) { scene = rule.scene; break; }
  }
  // 无场景时根据时间推断
  if (!scene) {
    if (isMorning) scene = '早晨';
    else if (isNoon) scene = '午间';
    else if (isAfternoon) scene = '下午';
    else if (isEvening) scene = '傍晚';
    else if (isLateNight) scene = '深夜';
  }

  // 提取实体
  const entities = extractEntities(text);

  // 兼容旧的 intent 字段（给其他函数用）
  const intent = deriveIntent(primaryTopic, primaryEmotion, scene, text);

  return { primaryTopic, secondaryTopic, topics, target, targetTone, primaryEmotion, emotions, scene, entities, intent, rawText: text };
}

// 从解析结果推导出旧版 intent（向后兼容）
function deriveIntent(topic, emotion, scene, text) {
  if (scene === '早晨起床' || /早安|早上好|morning/.test(text)) return '早安问候';
  if (scene === '睡前' || /晚安|good night/.test(text)) return '晚安问候';
  if (/生日|birthday|生快/.test(text)) return '生日祝福';
  if (topic === '美食') return '美食分享';
  if (topic === '工作') return '加班/打工人吐槽';
  if (topic === '旅行') return '旅行打卡';
  if (topic === '恋爱') return '恋爱秀恩爱';
  if (topic === '健身') return '健身/运动打卡';
  if (topic === '宠物') return '宠物日常';
  if (topic === '学习') return '学业/考试记录';
  if (topic === '家人') return '回家/思念家人';
  if (topic === '节日') return '节日祝福';
  if (emotion && emotion.emotion === '感谢') return '表达感谢';
  if (emotion && emotion.valence === 'negative') return '深夜emo/伤感文案';
  if (emotion && emotion.emotion === '开心') return '表达情绪-正向';
  if (topic === '天气') return '天气感慨';
  if (topic === '读书') return '读书/观影感悟';
  if (topic === '影视') return '读书/观影感悟';
  if (hour < 10) return '早安问候';
  if (hour >= 22 || hour < 5) return '深夜emo/伤感文案';
  return '日常生活记录';
}

// 旧的 detectIntent 保持兼容（内部调用新引擎）
function detectIntent(text) {
  const analysis = analyzeInput(text);
  return analysis.intent;
}

function detectCity(text) {
  const m = {'北京':0,'上海':1,'深圳':2,'广州':3,'杭州':4,'成都':5,'武汉':6,'长沙':7,'重庆':8,'南京':9,'三亚':10,'西安':11};
  for (const [k,v] of Object.entries(m)) { if (text.includes(k)) return POOL.city[v]; }
  return null;
}

function detectHoliday(text) {
  const h = {'春节':'春节','新年':'新年','元旦':'元旦','圣诞':'圣诞节','中秋':'中秋节','端午':'端午节','情人节':'情人节','七夕':'七夕','感恩':'感恩节'};
  for (const [k,v] of Object.entries(h)) { if (text.includes(k)) return v; }
  return null;
}

function detectWeekday(text) {
  const d = {'周一':1,'周二':2,'周三':3,'周四':4,'周五':5,'周六':6,'周日':0,'周末':6};
  for (const [k,v] of Object.entries(d)) { if (text.includes(k)) return {day:v, label:k}; }
  return null;
}

// ========== 模拟画像（多维度） ==========
function generateProfile(text) {
  const analysis = analyzeInput(text);
  const intent = analysis.intent;
  const cityObj = detectCity(text) || rp(POOL.city);
  const holiday = detectHoliday(text);
  const weekdayInfo = detectWeekday(text);
  return {
    intent, gender: rp(POOL.gender), age: rp(POOL.age), city: cityObj,
    job: rp(POOL.job), crowd: rp(POOL.crowd), formality: rp(POOL.formality),
    netSlang: rp(POOL.netSlang), enMix: rp(POOL.enMix), emotionType: rp(POOL.emotion),
    emojiLevel: rp(POOL.emojiLevel), dialect: getDialectForCity(cityObj), app: rp(POOL.app),
    brevity: rp(POOL.brevity), interest: pick(POOL.interest, 2),
    paragraphStyle: rp(POOL.paragraphStyle),
    callStyle: /宝贝|亲爱|老婆/.test(text) ? '亲昵型' : /总|老师|领导/.test(text) ? '正式型' : rp(POOL.callStyle),
    holiday, weekdayInfo,
    time: `${month}月${day}日 周${weekCN} ${timeCN} ${hour}:${String(minute).padStart(2,'0')}`,
    weather, season: season + '季', weekday: weekDay,
    // 新增：语义解析结果
    analysis,
  };
}

// ========== 主题文案素材库 ==========
// 每个主题下有大量基于场景、情绪、对象的文案模板
// 模板中 {input} = 用户原文，{food} = 识别到的食物，{activity} = 活动，{target} = 对象称谓等
const TOPIC_COPIES = {
  '美食': {
    positive: [
      '人间烟火气，最抚凡人心。{food_mention}这一口下去，什么烦恼都没了。',
      '{food_mention}的快乐，是这个世界上最朴实的浪漫。热气腾腾的食物面前，一切都值得期待。',
      '好吃到想原地转圈！{food_mention}请加入我的"人生必吃清单"。',
      '味蕾被击中的瞬间，整个人都亮了。{food_mention}——今日份的小确幸。',
      '吃到好吃的东西眼睛会发光，这大概就是人类最纯粹的快乐。{food_mention}，你做到了。',
      '这世界上有一种幸福叫"第一口就惊艳"。{food_mention}，没有辜负我的期待。',
    ],
    negative: [
      '心情不好的时候，{food_mention}就是最好的解药。没有什么是一顿好吃的解决不了的。',
      '今天状态不太行，但{food_mention}还是能让我短暂快乐一下。食物不会让你失望。',
      '丧归丧，饭还是要好好吃的。{food_mention}下肚，感觉又能撑一阵了。',
    ],
    neutral: [
      '认真吃饭的人，生活不会太差。{food_mention}——简单却治愈。',
      '日子平平淡淡，但{food_mention}给了它一点滋味。记录今天的餐桌。',
      '一日三餐，四季三餐。{food_mention}虽然普通，但就是这种普通让人安心。',
    ],
    with_target: {
      '恋人': ['和你一起吃{food_mention}，连空气都是甜的。你在的地方，就是最好的餐厅。', '你说想吃{food_mention}的时候，我就决定要带你去。和你在一起，什么都好吃。'],
      '朋友': ['和老友约一顿{food_mention}，聊到停不下来。最好的聚会不需要仪式感，有好吃的和对的人就够了。'],
      '家人': ['{food_mention}的味道，像极了小时候的家。不管走多远，胃永远记得家的方向。'],
      '自己': ['一个人吃{food_mention}也可以很享受。学会独处的第一步，就是学会好好吃饭。'],
    },
  },
  '工作': {
    positive: [
      '今天的项目终于落地了！虽然过程磕磕绊绊，但成就感是真实的。打工人也有高光时刻。',
      '被认可的感觉真好。工作虽苦，但偶尔的正反馈足以支撑下一段征途。',
      '忙碌但充实的一天。把事情做好本身就是一种快乐，虽然嘴上说着累。',
    ],
    negative: [
      '又是被工作按在地上摩擦的一天。{input_core}——打工人的叹息没人听得见。',
      '身体已经在工位了，灵魂还在被窝里。{input_core}，今天也在努力假装很积极。',
      '成年人的崩溃是悄无声息的。{input_core}，但明天还是得笑着说"收到"。',
      '下班的那一刻才是真正的我。{input_core}，打工人的心酸只有打工人懂。',
      '需求又改了，deadline是昨天，咖啡已经续到第四杯。{input_core}，这就是职场日常。',
    ],
    neutral: [
      '打工人的日常，平凡但真实。{input_core}，每天都在认真对付这个世界。',
      '不好不坏的工作日，不咸不淡的职场生活。{input_core}，日子就这样一天天过去。',
      '准时下班是最好的福报。{input_core}，今天的任务已完成，剩下的交给明天。',
    ],
    with_target: {
      '同事': ['在职场里遇到靠谱的同事是一种幸运。{input_core}，好在不是一个人在扛。'],
      '自己': ['{input_core}\n\n记录一下打工人的日常。努力赚钱的每一天，都是在为未来的自己铺路。'],
    },
  },
  '恋爱': {
    positive: [
      '遇见你之后，我的世界从黑白变成了彩色。{input_core}——你是我所有浪漫的来源。',
      '喜欢你这件事，已经是我人生中做过最正确的决定了。{input_core}',
      '{input_core}\n\n你的存在让每一个平凡的日子都变得有意义。余生请多指教。',
      '和你在一起的每一天都是限定版的快乐。{input_core}——我的偏爱只给你。',
    ],
    negative: [
      '{input_core}\n\n爱一个人是勇敢的事，受伤了也别后悔曾经的心动。',
      '有些人注定只能陪你走一段路。{input_core}——但那段路上的风景，我会一直记得。',
    ],
    neutral: [
      '{input_core}\n\n爱情这件事，不需要很完美，需要很真诚。',
      '平淡中的小甜蜜，才是爱情最好的样子。{input_core}',
    ],
    with_target: {
      '恋人': ['{input_core}\n\n我对你的喜欢，像风走了八千里，不问归期。', '你是我的碎碎念，也是我的甜甜圈。{input_core}'],
    },
  },
  '旅行': {
    positive: [
      '终于出发了！背上行囊的那一刻，所有的疲惫都被期待替换。{input_core}',
      '世界很大，一定要去看看。{input_core}——每一次出发都是一次重生。',
      '眼睛在天堂，双脚在路上。{input_core}——最好的风景永远在下一个转角。',
    ],
    negative: [
      '旅行的意义不只是风景。{input_core}——有时候是为了逃离，有时候是为了回归。',
    ],
    neutral: [
      '用脚步丈量世界，用相机记录时光。{input_core}——在路上，就是最好的状态。',
      '{input_core}\n\n旅行不是为了到达目的地，而是感受沿途的风景和心境。',
    ],
    with_target: {
      '恋人': ['和你一起看过的风景，是这辈子最美的滤镜。{input_core}'],
      '朋友': ['最好的旅行搭子，就是走了一天还能一起笑着说"再走会儿"。{input_core}'],
      '自己': ['一个人旅行，是和自己的一次深度对话。{input_core}——学会享受孤独也是一种能力。'],
    },
  },
  '健身': {
    positive: [
      '跑完最后一公里的感觉——世界突然清晰了。{input_core}，汗水不会骗人。',
      '自律给我自由。{input_core}——今天也完成了和自己的约定。',
      '运动后的多巴胺是最健康的快乐。{input_core}，人生需要这种酣畅淋漓。',
    ],
    negative: [
      '不想动的时候才最该动。{input_core}——把不开心跑出去，把好心情跑回来。',
    ],
    neutral: [
      '身体是灵魂的容器，好好照顾它。{input_core}——日拱一卒，功不唐捐。',
      '{input_core}\n\n坚持运动这件事，开始最难，但一旦开始就停不下来。',
    ],
  },
  '学习': {
    positive: [
      '今天的收获值得记录。{input_core}——学海无涯，但每一步都值得。',
      '那种突然顿悟的感觉，太妙了。{input_core}——知识改变的不只是认知，是整个世界。',
    ],
    negative: [
      '{input_core}\n\n学习的路上偶尔想放弃也正常，但还是要告诉自己：再坚持一下。',
      '书看不进去，题做不出来。{input_core}——但现在吃的苦，都会变成未来的甜。',
    ],
    neutral: [
      '{input_core}\n\n认真学习的时光，是给未来自己最好的礼物。',
      '图书馆的灯光下，每一个埋头苦读的人都在为未来发光。{input_core}',
    ],
  },
  '宠物': {
    positive: [
      '有毛孩子的日子，每天都被治愈。{input_core}——你是我的小天使没错了。',
      '{input_core}\n\n它可能不懂你说的每句话，但它懂你所有的情绪。这就是宠物的魔力。',
    ],
    neutral: [
      '铲屎官的日常：崩溃又快乐着。{input_core}——但看到那张小脸就什么都值了。',
      '{input_core}\n\n养了宠物才知道，原来"被需要"是一种幸福。',
    ],
  },
  '家人': {
    positive: [
      '家是永远的港湾。{input_core}——有家人在的地方，就是最温暖的坐标。',
    ],
    negative: [
      '{input_core}\n\n在外面再坚强的人，想起家的时候也会变得柔软。',
      '电话那头的声音总是让人鼻子一酸。{input_core}——愿时光慢一点，让我陪你们久一点。',
    ],
    neutral: [
      '{input_core}\n\n家人是这个世界上最特别的存在——不需要理由，只需要在。',
      '平凡的日子因为有家人而温暖。{input_core}——世间所有的坚持，都有一个叫"家"的理由。',
    ],
    with_target: {
      '父母': ['{input_core}\n\n长大了才明白，父母的唠叨是这世上最温柔的牵挂。', '爸妈永远是那个无条件站在你身后的人。{input_core}——我也要成为你们的骄傲。'],
      '长辈': ['{input_core}\n\n{target_name}的笑容是家里最温暖的风景。愿时光慢一些，让我们多陪您一些。', '有{target_name}在的地方，就有安心和温暖。{input_core}——小时候您守护我们，现在换我们来守护您。'],
    },
  },
  '友情': {
    positive: [
      '好久不见，一见面就停不下来。{input_core}——真正的友谊不怕时间考验。',
      '{input_core}\n\n最好的朋友就是——不管多久没见，坐下来就像昨天刚聊过。',
    ],
    neutral: [
      '{input_core}\n\n朋友不在多，在于真。感谢生命中每一个陪伴过的人。',
    ],
  },
  '天气': {
    positive: [
      '今天的天空蓝得不像话。{input_core}——好天气配好心情，是大自然最慷慨的礼物。',
    ],
    negative: [
      '窗外灰蒙蒙的，心情也跟着阴了。{input_core}——不过没关系，天总会放晴。',
      '下雨天适合发呆和喝咖啡。{input_core}——雨声是天然的白噪音，治愈系。',
    ],
    neutral: [
      '{input_core}\n\n天气会变，但好心情可以自己创造。记录此刻的天空。',
    ],
  },
  '读书': {
    positive: [
      '读到一本好书的感觉，就像遇见了一个知己。{input_core}——文字的力量，超乎想象。',
    ],
    neutral: [
      '{input_core}\n\n安静地读一本书，是这个浮躁时代最奢侈的事。',
      '一个人的气质里，藏着他读过的书。{input_core}——阅读是最低成本的自我升级。',
    ],
  },
  '影视': {
    positive: [
      '看完之后久久不能平静。{input_core}——好的故事让人活了不止一辈子。',
    ],
    neutral: [
      '{input_core}\n\n每部电影都是一扇通往平行世界的门。打开它，就是一段新的旅程。',
    ],
  },
  '游戏': {
    positive: [
      '今天的手感绝了！{input_core}——游戏里的快乐，简单又纯粹。',
      '{input_core}\n\n打赢的那一刻，什么烦恼都没了。这就是游戏的魔力。',
    ],
    negative: [
      '{input_core}\n\n又输了……但没关系，下一局一定赢（flag已立）。',
    ],
    neutral: [
      '{input_core}\n\n成年人的解压方式：开一局游戏，忘掉全世界。',
    ],
  },
  '节日': {
    positive: [
      '{input_core}\n\n节日快乐！愿每一个特别的日子都有温暖相伴。',
    ],
    neutral: [
      '节日的意义不在于仪式感，而在于和谁一起度过。{input_core}',
    ],
  },
  '购物': {
    positive: [
      '拆快递的快乐你不懂！{input_core}——生活嘛，偶尔犒劳一下自己也是应该的。',
    ],
    neutral: [
      '{input_core}\n\n购物车里装的不是商品，是对美好生活的向往（和下个月的花呗）。',
    ],
  },
  '摄影': {
    positive: [
      '按下快门的那一刻，时光被定格。{input_core}——好的照片自己会说话。',
    ],
    neutral: [
      '{input_core}\n\n摄影是光和影的对话，也是此刻心境的投射。',
    ],
  },
  '穿搭': {
    positive: [
      '今日份的OOTD，满意！{input_core}——穿自己喜欢的衣服，走自己喜欢的路。',
    ],
    neutral: [
      '{input_core}\n\n穿搭是一个人最外在的表达。今天也要做一个好看的人。',
    ],
  },
  '音乐': {
    positive: [
      '单曲循环一整天停不下来。{input_core}——音乐是灵魂的语言。',
    ],
    neutral: [
      '{input_core}\n\n戴上耳机的那一刻，世界只剩下我和旋律。',
    ],
  },
  '生日': {
    positive: [
      '生日快乐！愿今后的每一天都如今日般温暖明亮。{input_core}',
      '{input_core}\n\n又是一年好时光，愿所有美好如约而至，愿所有期待都不被辜负。',
      '在这个特别的日子里，{input_core}。愿你被这个世界温柔以待，愿所有的幸福不期而遇。',
      '{input_core}！新的一岁，愿你心中有爱、眼里有光、脚下有路。',
    ],
    neutral: [
      '{input_core}\n\n时光匆匆，又翻过一页。愿新的一岁，万事顺遂，平安喜乐。',
      '生日快乐。{input_core}——愿你所求皆如愿，所行皆坦途。',
    ],
    with_target: {
      '长辈': [
        '祝{target_name}生日快乐，福如东海、寿比南山！愿您身体健康、笑口常开，儿孙满堂承欢膝下。',
        '{target_name}，生日快乐！岁月从不败您的精神，愿您每一天都健康平安、开心顺意。我们永远爱您。',
        '在这个特别的日子，祝{target_name}生日快乐！感谢您一直以来的疼爱与包容，愿时光慢一些，让我们多陪您一些。',
        '祝{target_name}生日快乐！您是家里的定海神针，有您在就有温暖和安心。愿您福寿安康，万事如意。',
        '{target_name}生日快乐！小时候您把我们捧在手心，现在换我们来守护您。愿您健健康康，天天开心。',
        '敬祝{target_name}生辰快乐！愿岁月温柔以待您，愿每一天都有好心情、好身体。我们爱您。',
      ],
      '父母': [
        '爸/妈，生日快乐！这世界上最想说的谢谢，是对您说的。愿时光慢一些，让我好好陪您。',
        '{target_name}生日快乐！从小到大，您操碎了心。今天是您的日子，好好休息，一切有我们。',
        '祝{target_name}生日快乐！您永远是最伟大的人。愿新的一岁身体健康、笑口常开，我会努力让您骄傲。',
        '{target_name}，生日快乐！小时候您总记得我的每一个生日，现在轮到我了。爱您，永远。',
        '生日快乐！{target_name}。长大后才明白，所有的唠叨都是因为爱。谢谢您一直守护着我们。',
      ],
      '恋人': [
        '宝贝生日快乐！遇见你是我最大的幸运，余生的每一个生日，我都想陪你过。',
        '亲爱的，生日快乐！愿你永远像个小孩，开心、简单、被宠爱。我来负责宠你。',
        '今天的你是全世界最特别的存在。生日快乐，我的宝贝。愿我能陪你走过每一个春夏秋冬。',
        '在你生日这天，我什么都不想说，只想抱抱你，然后告诉你：有你真好，生日快乐。',
      ],
      '朋友': [
        '老友，生日快乐！感谢命运让我们相遇。愿你的新一岁，想要的都得到，得不到的都释怀。',
        '生日快乐！祝你永远热泪盈眶，永远年轻永远快乐。我们的友谊和你一样，越来越好。',
        'Happy Birthday！{input_core}！愿你被世界温柔以待，有梦可追、有酒可喝、有友可陪。',
        '祝你生日快乐！新的一岁继续做那个闪闪发光的你。下次请你吃饭（说到做到）。',
      ],
      '孩子': [
        '宝贝生日快乐！愿你像阳光一样温暖、像星星一样闪亮。爸爸妈妈永远爱你。',
        '小朋友，生日快乐！又长大一岁啦，愿你的世界永远充满童话和彩虹。健康快乐地长大吧！',
        '亲爱的宝贝，生日快乐！你是上天给我们最好的礼物。愿你无忧无虑，快快乐乐地成长。',
      ],
      '自己': [
        '生日快乐，亲爱的自己。这一年辛苦了。新的一岁，对自己好一点，你值得所有美好。',
        '又老了一岁，但也更懂自己了。生日快乐，感谢自己一直没有放弃。',
        '今天是我的日子。{input_core}——感谢自己的坚持和勇敢，新的一岁继续加油。',
      ],
      '陌生人/公众': [
        '生日快乐！愿你新的一岁平安顺遂、万事胜意。值得被祝福的你，也请继续发光。',
      ],
    },
  },
};

// 通用文案（当没有匹配到特定主题时）
const GENERIC_COPIES = {
  positive: [
    '今天的心情格外好！{input_core}——生活偶尔给的小惊喜，要用力接住。',
    '{input_core}\n\n开心的事情要记录下来，以后翻到还能笑出来。',
    '世界偶尔很美好。{input_core}——值得被记住的一天。',
  ],
  negative: [
    '{input_core}\n\n说不上来为什么，就是有点丧。但没关系，天总会亮。',
    '今天的情绪不太好。{input_core}——但允许自己偶尔不开心，也是一种温柔。',
    '{input_core}\n\n深呼吸，一切都会过去的。不好的日子也算数，但明天会更好。',
  ],
  neutral: [
    '{input_core}\n\n记录此刻。平凡的日子也值得被善待。',
    '生活没有那么多惊天动地。{input_core}——但日常的碎片拼起来，就是完整的人生。',
    '{input_core}\n\n不好不坏的一天，平平淡淡才是真。',
  ],
  '早安': [
    '新的一天，新的开始。{input_core}\n\n阳光温暖，微风不燥，一切都在变好的路上。早安。',
    '清晨的第一缕阳光替你安排了今天的好运清单。{input_core}\n\n出门记得带好心情。早安~',
    '醒来的每一天都值得被认真对待。{input_core}\n\n今天也要元气满满。早安！',
  ],
  '晚安': [
    '一天结束了，该好好休息了。{input_core}\n\n把今天的烦恼打包寄走，明天又是崭新的一天。晚安~',
    '夜深了，窗外的灯火替你守着这座城。{input_core}\n\n闭上眼，好好休息。晚安。',
    '{input_core}\n\n今天也辛苦了。让所有的不开心随着夜色散去。晚安。',
  ],
  '生日': [
    '生日快乐！{input_core}\n\n愿所有的美好都如约而至，愿新的一岁万事胜意。',
    '{input_core}\n\n今天是特别的日子。吹灭蜡烛的瞬间，所有愿望都会实现。生日快乐！',
    '{input_core}\n\n愿你被这个世界温柔以待，愿每一天都值得庆祝。生日快乐！',
  ],
};

// ========== 基于语义解析的文案生成引擎 ==========
function generateCopies(text, p) {
  const a = p.analysis || analyzeInput(text);
  let topic = a.primaryTopic;
  const valence = a.primaryEmotion.valence;
  const target = a.target;
  const scene = a.scene;
  const entities = a.entities;

  // 场景驱动的主题覆盖：生日场景时强制使用生日主题（而不是家人/恋爱等）
  if (scene === '生日' || a.intent === '生日祝福') {
    topic = '生日';
  }

  // 提取用户输入的核心内容（去掉场景词、语气词等，保留有信息量的部分）
  const inputCore = extractCore(text);

  // 从原文中提取表达对象的具体称谓（爷爷/奶奶/妈妈等，而不是规则名"长辈/父母"）
  const targetName = extractTargetName(text, target);

  // 准备替换变量
  const vars = {
    input: text,
    input_core: inputCore || text,
    food_mention: entities.food.length > 0 ? entities.food.join('、') : '这一口',
    activity_mention: entities.activity.length > 0 ? entities.activity.join('、') : '',
    target_name: targetName,
    time_cn: timeCN,
    city_name: p.city.name.split('·')[0],
    city_alias: p.city.alias,
    landmark: rp(p.city.landmarks),
    season_name: p.season,
    weather_name: p.weather,
    month: month,
    day: day,
    weekCN: weekCN,
  };

  const results = [];

  // 策略1：基于主题的精准文案
  if (topic && TOPIC_COPIES[topic]) {
    const topicPool = TOPIC_COPIES[topic];
    // 先看有没有针对表达对象的
    if (target && topicPool.with_target && topicPool.with_target[target]) {
      const targetCopies = topicPool.with_target[target];
      results.push({ style: `${topic}·${target}专属`, dimension: `主题·${topic} + 对象·${target}`, text: fillTemplate(rp(targetCopies), vars) });
    }
    // 再按情绪倾向选文案
    const emotionPool = topicPool[valence] || topicPool['neutral'] || [];
    if (emotionPool.length > 0) {
      const picked = pick(emotionPool, 2);
      picked.forEach((tmpl, i) => {
        results.push({ style: `${topic}·${a.primaryEmotion.emotion}`, dimension: `主题·${topic} + 情感·${a.primaryEmotion.emotion}`, text: fillTemplate(tmpl, vars) });
      });
    }
  }

  // 策略2：场景+时间文案（生日场景已在策略1中处理，不再重复）
  if (scene === '早晨起床' || a.intent === '早安问候') {
    results.push({ style: '早安问候', dimension: `场景·${scene || '早晨'}`, text: fillTemplate(rp(GENERIC_COPIES['早安']), vars) });
  } else if (scene === '睡前' || a.intent === '晚安问候') {
    results.push({ style: '晚安问候', dimension: `场景·${scene || '睡前'}`, text: fillTemplate(rp(GENERIC_COPIES['晚安']), vars) });
  } else if (a.intent === '生日祝福' && topic !== '生日') {
    // 仅当策略1没有走生日主题时，才兜底用通用生日文案
    results.push({ style: '生日祝福', dimension: '场景·生日', text: fillTemplate(rp(GENERIC_COPIES['生日']), vars) });
  }

  // 策略3：情绪驱动的文案
  if (a.primaryEmotion.strength > 0) {
    const genericPool = GENERIC_COPIES[valence] || GENERIC_COPIES['neutral'];
    results.push({ style: `情绪·${a.primaryEmotion.emotion}`, dimension: `情感·${a.primaryEmotion.emotion}(${valence === 'positive' ? '正向' : valence === 'negative' ? '负向' : '中性'})`, text: fillTemplate(rp(genericPool), vars) });
  }

  // 策略4：维度特色（方言、网络用语、城市、职业等，保留原有特色）
  const dimCopies = buildDimensionCopy(text, p, vars, a);
  dimCopies.forEach(c => results.push(c));

  // 去重 + 限制数量
  const seen = new Set();
  const unique = results.filter(r => {
    const key = r.text.slice(0, 30);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  return unique.slice(0, Math.max(4, Math.min(8, unique.length)));
}

// 提取输入的核心内容（去掉场景引导词、语气词等）
function extractCore(text) {
  let core = text
    .replace(/^(我想说|我想表达|帮我写|帮我生成|给我写|想发|想说|今天|我觉得|感觉)[：:，,]?\s*/i, '')
    .replace(/(吧|啊|呀|呢|哦|嘛|了|的说|来着|哈哈|嘿嘿|哈|嗯|额|啦)$/g, '')
    .trim();
  return core || text;
}

// 从原文中提取实际的对象称谓（爷爷/外婆/妈妈等），而非规则分类名
function extractTargetName(text, targetCategory) {
  // 按对象类别，尝试从原文中找到具体的称谓
  const nameMap = {
    '长辈': ['爷爷','奶奶','外公','外婆','姥姥','姥爷','叔叔','阿姨','伯伯','舅舅','姑姑','姨妈','大伯'],
    '父母': ['妈妈','爸爸','母亲','父亲','老妈','老爸','爸','妈','爹','娘'],
    '恋人': ['老公','老婆','男朋友','女朋友','宝贝','亲爱的','对象'],
    '朋友': ['朋友','闺蜜','兄弟','死党','发小','老友','好友','姐妹','哥们'],
    '同事': ['同事','领导','老板','上司','总监','经理','组长'],
    '老师': ['老师','教授','导师','班主任','师父','师傅'],
    '孩子': ['儿子','女儿','宝宝','孩子','闺女','崽','娃'],
  };
  if (targetCategory && nameMap[targetCategory]) {
    for (const name of nameMap[targetCategory]) {
      if (text.includes(name)) return name;
    }
  }
  // 尝试所有类别
  for (const names of Object.values(nameMap)) {
    for (const name of names) {
      if (text.includes(name)) return name;
    }
  }
  return targetCategory || '';
}

// 模板填充
function fillTemplate(template, vars) {
  return template
    .replace(/\{input\}/g, vars.input)
    .replace(/\{input_core\}/g, vars.input_core)
    .replace(/\{food_mention\}/g, vars.food_mention)
    .replace(/\{activity_mention\}/g, vars.activity_mention)
    .replace(/\{target_name\}/g, vars.target_name)
    .replace(/\{time_cn\}/g, vars.time_cn)
    .replace(/\{city_name\}/g, vars.city_name)
    .replace(/\{city_alias\}/g, vars.city_alias)
    .replace(/\{landmark\}/g, vars.landmark)
    .replace(/\{season_name\}/g, vars.season_name)
    .replace(/\{weather_name\}/g, vars.weather_name)
    .replace(/\{month\}/g, vars.month)
    .replace(/\{day\}/g, vars.day)
    .replace(/\{weekCN\}/g, vars.weekCN);
}

// 维度特色文案（保留方言、网络用语、城市等原有特色，但也基于语义解析来选择）
function buildDimensionCopy(input, p, vars, a) {
  const results = [];
  const cn = p.city.name.split('·')[0], ca = p.city.alias, lm = rp(p.city.landmarks);
  const inputCore = vars.input_core;

  // 城市特色
  if (a.primaryTopic === '旅行' || Math.random() > 0.5) {
    results.push({
      style: `${ca}视角`,
      dimension: `地理·${p.city.name}`,
      text: rp([
        `📍${cn}\n\n${inputCore}\n\n${lm}的风带着这座城市的故事路过。${ca}，在这里的每一天都值得记录。`,
        `${ca}的${timeCN}，${lm}${p.weather==='晴天'?'在阳光下格外好看':'笼罩在薄雾中别有韵味'}。\n\n${inputCore}\n\n在${cn}生活，是一种独特的体验。`,
      ]),
    });
  }

  // 方言特色
  if (p.dialect !== '无方言') {
    const dialectCopy = buildDialectCopy(inputCore, p, a);
    if (dialectCopy) {
      results.push({ style: `${p.dialect}方言`, dimension: `方言·${p.dialect}`, text: dialectCopy });
    }
  }

  // 网络用语风格
  if (p.netSlang === '重度') {
    results.push({
      style: '网络热梗',
      dimension: '网络用语·重度',
      text: rp([
        `家人们谁懂啊！${inputCore}😭 绝绝子yyds！DNA动了！这波直接封神～`,
        `${inputCore}\n\n好家伙我直接好家伙！确诊为当代显眼包了💀 建议所有人都来冲！`,
        `啊啊啊啊啊救命！${inputCore} 我真的会谢！这也太可以了吧！`,
      ]),
    });
  }

  // 职业视角
  if (a.primaryTopic === '工作' || Math.random() > 0.7) {
    const jobCopy = buildJobCopy(inputCore, p, a);
    if (jobCopy) {
      results.push({ style: `${p.job}视角`, dimension: `职业·${p.job}`, text: jobCopy });
    }
  }

  return results.sort(() => Math.random() - 0.5).slice(0, 2);
}

// 方言文案生成（基于语义）
function buildDialectCopy(inputCore, p, a) {
  const topic = a.primaryTopic;
  switch (p.dialect) {
    case '东北':
      if (topic === '美食') return `嘎嘎好吃！${inputCore} 老铁们这个必须安排上！贼拉香，谁吃谁知道！`;
      if (topic === '工作') return `上班累得不行了！${inputCore} 老铁们加油整，下班必须整顿好吃的犒劳自己！`;
      return `嘎嘎${rp(['好','棒'])}的${timeCN}！${inputCore} 老铁们冲就完了！贼拉带劲！`;
    case '四川':
      if (topic === '美食') return `${inputCore} 巴适得板🌶️ 这个味道简直绝了！吃完只想说：安逸噻～`;
      if (topic === '工作') return `${inputCore} 烦死个人了，算了算了，先${rp(['整碗豆花','喝杯盖碗茶'])}缓哈再说。安逸！`;
      return `${timeCN}好哇～${inputCore} 巴适得板🌶️ 管他三七二十一，安逸噻～`;
    case '粤语':
      if (topic === '美食') return `${inputCore}\n\n好犀利啊！好好味！识嘅自然识啦，饮杯靓茶先～`;
      return `${inputCore}\n\n真系冇得顶💪 识嘅自然识啦，${timeCN}饮杯靓茶先～`;
    case '北京腔':
      if (topic === '美食') return `嘿，${inputCore} 这口味儿绝了，倍儿地道！回头得再来一趟，美着呢～`;
      return `嘿，${timeCN}好！${inputCore} 今儿个${rp(['倍儿棒','还行吧'])}，出门遛个弯儿，美着呢～`;
    case '陕西':
      return `额滴神啊，${inputCore} ${timeCN}了还在${rp(['刷手机','忙活'])}，赶紧吃碗biangbiang面，撩咋咧～`;
    case '湖北':
      if (topic === '美食') return `${inputCore}\n\n过早了冇？搞碗热干面先，这才是正经事～`;
      return `${inputCore}\n\n个板妈的，今天${timeCN}过得蛮快的。搞杯热干面先，过早才是正经事～`;
    case '湖南':
      return `${inputCore}\n\n恰饭了冇？${timeCN}了要好好恰饭，不恰饭哪有力气搞事情。加油咧～`;
    case '上海话':
      return `${inputCore}\n\n今朝${timeCN}交关好，侬晓得伐？出门白相白相，老开心额～`;
    default:
      return null;
  }
}

// 职业视角文案
function buildJobCopy(inputCore, p, a) {
  switch (p.job) {
    case 'IT互联网':
      if (a.primaryTopic === '工作') return rp([
        `${inputCore}\n\n// TODO: 下班\n// FIXME: 永远下不了班\n// console.log("今天怎么样") → "又改需求了"`,
        `${inputCore}\n\n产品经理又有新想法了（第N版），deadline是昨天。但我微笑着说：收到～`,
      ]);
      return `${inputCore}\n\n——来自一个程序员在${timeCN}的碎碎念。if (心情 === '好') { 继续写代码 }`;
    case '教育':
      return `${inputCore}\n\n铃声响起前的校园最安静。泡杯茶看看窗外📚 又是桃李满天下的一天~`;
    case '学生':
      return `${inputCore}\n\n图书馆的座位还是那么难抢，但青春就该这样热热闹闹地过📚`;
    case '设计':
      return `${inputCore}\n\n甲方说"感觉差点意思"——这句话是设计师的噩梦🎨 但创意不会枯竭，灵感就在下一个像素。`;
    case '医疗':
      return `${inputCore}\n\n穿上白大褂的那一刻，所有的疲惫都有了意义。每一天都在守护生命。`;
    default:
      return `${inputCore}\n\n${p.job}的日常，平凡却真实。每一天都在认真生活。`;
  }
}

// ========== 模拟用户生成 ==========
const UNAMES_F = ['小鹿Emily','月亮糖果','是七七呀','奶茶少女','温柔的风','樱桃小丸子','星河漫步','甜甜圈Louise','猫系少女','向日葵Sunny','蜜桃乌龙','森系女孩','可可椰子','鲸鱼小姐','棉花糖Coco'];
const UNAMES_M = ['北城以北','代码小王子','夜跑侠','老陈说说','浪里格浪','阿杰在路上','不加糖的咖啡','山顶上的人','深夜食堂老板','骑行少年Leo','二狗子本狗','码农日记','星辰大海','南风知我意'];
const AVATARS = ['🧑‍💻','👩‍🎨','🧑‍🍳','👨‍💼','👩‍🏫','🧑‍🔬','👨‍🎤','👩‍💻','🧑‍🚀','👨‍🌾','👩‍⚕️','🧑‍🎓','🦊','🐱','🐶','🐼'];

function generateSimUser(p) {
  return {
    name: p.gender==='女' ? rp(UNAMES_F) : rp(UNAMES_M),
    avatar: rp(AVATARS),
    uid: 'U'+String(Math.floor(Math.random()*900000)+100000),
    gender: p.gender, age: p.age, city: p.city.name, job: p.job, crowd: p.crowd,
    registerDays: Math.floor(Math.random()*1000)+30,
    postsCount: Math.floor(Math.random()*500)+10,
    followersCount: Math.floor(Math.random()*5000)+50,
    activeTime: rp(['早起型(6-9点活跃)','午间型(12-14点活跃)','夜猫型(22-1点活跃)','全天活跃型']),
    device: rp(['iPhone 15 Pro','iPhone 14','华为Mate 60','小米14','OPPO Find X7']),
    os: rp(['iOS 18.2','iOS 17.5','Android 15','HarmonyOS 4.2']),
    topWords: pick(['真的','绝了','哈哈','yyds','救命','好看','家人们','宝子','冲鸭','nice'], 3),
    emotion: p.emotionType, emojiLevel: p.emojiLevel, netSlang: p.netSlang,
    enMix: p.enMix, dialect: p.dialect, brevity: p.brevity,
    formality: p.formality, interest: p.interest.join('、'), app: p.app,
    callStyle: p.callStyle, paragraphStyle: p.paragraphStyle,
  };
}

// ========== 主生成函数 ==========
let generating = false;
function generate() {
  const input = document.getElementById('userInput').value.trim();
  if (!input) { toast('请先输入点什么吧'); return; }
  if (generating) return;
  generating = true;
  document.getElementById('recSection').style.display = 'none';
  document.getElementById('filterSection').style.display = 'none';
  document.getElementById('results').classList.remove('show');
  document.getElementById('profile').classList.remove('show');
  document.getElementById('simUser').classList.remove('show');
  document.getElementById('loading').classList.add('show');
  document.getElementById('genBtn').disabled = true;

  setTimeout(() => {
    const profile = generateProfile(input);
    const copies = generateCopies(input, profile);
    const simUser = generateSimUser(profile);
    renderResults(copies);
    renderProfile(profile);
    renderSimUser(simUser);
    document.getElementById('loading').classList.remove('show');
    document.getElementById('results').classList.add('show');
    document.getElementById('profile').classList.add('show');
    document.getElementById('simUser').classList.add('show');
    document.getElementById('genBtn').disabled = false;
    generating = false;
    document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 1200);
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>'); }

function renderResults(copies) {
  document.getElementById('resultList').innerHTML = copies.map((c, i) => `
    <div class="r-item">
      <div class="r-num">${i + 1}</div>
      <span class="r-style">${c.style}</span>
      <span class="r-dimension">${c.dimension}</span>
      <div class="r-text">${escHtml(c.text)}</div>
      <div class="r-foot"><button class="r-btn" onclick="copyText(this,${i})">📋 复制</button></div>
    </div>
  `).join('');
  window._copies = copies;
}

function copyText(btn, idx) {
  navigator.clipboard.writeText(window._copies[idx].text).then(() => {
    btn.innerHTML = '✅ 已复制'; btn.classList.add('copied'); toast('已复制到剪贴板');
    setTimeout(() => { btn.innerHTML = '📋 复制'; btn.classList.remove('copied'); }, 2000);
  });
}

function renderProfile(p) {
  const a = p.analysis || {};
  const tags = [
    {l:'识别意图',v:p.intent},
    {l:'表达主题',v:a.primaryTopic || '通用'},
    {l:'表达对象',v:a.target || '通用/公众'},
    {l:'情绪识别',v:a.primaryEmotion ? `${a.primaryEmotion.emotion}(${a.primaryEmotion.valence === 'positive' ? '正向' : a.primaryEmotion.valence === 'negative' ? '负向' : '中性'})` : '平静'},
    {l:'场景识别',v:a.scene || '未识别'},
    {l:'性别',v:p.gender},{l:'年龄段',v:p.age},
    {l:'地理位置',v:p.city.name},{l:'职业',v:p.job},{l:'人群属性',v:p.crowd},
    {l:'情感倾向',v:p.emotionType},{l:'正式程度',v:p.formality},
    {l:'网络用语',v:p.netSlang},{l:'Emoji程度',v:p.emojiLevel},
    {l:'中英混用',v:p.enMix},{l:'方言',v:p.dialect},
    {l:'简繁偏好',v:p.brevity},{l:'分段习惯',v:p.paragraphStyle},
    {l:'兴趣偏好',v:p.interest.join('、')},{l:'宿主APP',v:p.app},
    {l:'当前时间',v:p.time},{l:'天气',v:p.weather},{l:'季节',v:p.season},
  ];
  // 有实体时展示
  if (a.entities) {
    if (a.entities.food.length > 0) tags.splice(5, 0, {l:'识别食物',v:a.entities.food.join('、')});
    if (a.entities.activity.length > 0) tags.splice(5, 0, {l:'识别活动',v:a.entities.activity.join('、')});
  }
  if (p.holiday) tags.splice(1,0,{l:'节日',v:p.holiday});
  if (p.weekdayInfo) tags.splice(1,0,{l:'星期',v:p.weekdayInfo.label});
  document.getElementById('profileGrid').innerHTML = tags.map(t=>`<div class="p-tag"><b>${t.l}</b>${t.v}</div>`).join('');
}

function renderSimUser(u) {
  document.getElementById('simUserGrid').innerHTML = `
    <div class="sim-user-item sim-user-full" style="display:flex;align-items:center;gap:12px;padding:12px 14px">
      <div style="font-size:36px;line-height:1">${u.avatar}</div>
      <div><div style="font-size:15px;font-weight:700;color:#fff;margin-bottom:2px">${u.name}</div>
      <div style="font-size:11px;color:#a29bfe">UID: ${u.uid} · 注册${u.registerDays}天</div></div>
    </div>
    <div class="sim-user-divider"></div>
    <div class="sim-user-item"><div class="su-label">性别</div><div class="su-value">${u.gender}</div></div>
    <div class="sim-user-item"><div class="su-label">年龄段</div><div class="su-value">${u.age}</div></div>
    <div class="sim-user-item"><div class="su-label">城市</div><div class="su-value">${u.city}</div></div>
    <div class="sim-user-item"><div class="su-label">职业</div><div class="su-value">${u.job}</div></div>
    <div class="sim-user-item"><div class="su-label">人群标签</div><div class="su-value">${u.crowd}</div></div>
    <div class="sim-user-item"><div class="su-label">活跃时间</div><div class="su-value">${u.activeTime}</div></div>
    <div class="sim-user-item"><div class="su-label">设备型号</div><div class="su-value">${u.device}</div></div>
    <div class="sim-user-item"><div class="su-label">系统版本</div><div class="su-value">${u.os}</div></div>
    <div class="sim-user-divider"></div>
    <div class="sim-user-item"><div class="su-label">情感倾向</div><div class="su-value">${u.emotion}</div></div>
    <div class="sim-user-item"><div class="su-label">Emoji程度</div><div class="su-value">${u.emojiLevel}</div></div>
    <div class="sim-user-item"><div class="su-label">网络用语</div><div class="su-value">${u.netSlang}</div></div>
    <div class="sim-user-item"><div class="su-label">中英混用</div><div class="su-value">${u.enMix}</div></div>
    <div class="sim-user-item"><div class="su-label">方言偏好</div><div class="su-value">${u.dialect}</div></div>
    <div class="sim-user-item"><div class="su-label">正式程度</div><div class="su-value">${u.formality}</div></div>
    <div class="sim-user-item"><div class="su-label">简繁偏好</div><div class="su-value">${u.brevity}</div></div>
    <div class="sim-user-item"><div class="su-label">分段习惯</div><div class="su-value">${u.paragraphStyle}</div></div>
    <div class="sim-user-item"><div class="su-label">称呼风格</div><div class="su-value">${u.callStyle}</div></div>
    <div class="sim-user-item"><div class="su-label">兴趣偏好</div><div class="su-value">${u.interest}</div></div>
    <div class="sim-user-divider"></div>
    <div class="sim-user-item"><div class="su-label">宿主APP</div><div class="su-value">${u.app}</div></div>
    <div class="sim-user-item"><div class="su-label">发帖数</div><div class="su-value">${u.postsCount}条</div></div>
    <div class="sim-user-item"><div class="su-label">粉丝数</div><div class="su-value">${u.followersCount}</div></div>
    <div class="sim-user-item sim-user-full"><div class="su-label">高频口头禅</div><div class="su-value">${u.topWords.map(w=>'"'+w+'"').join('  ')}</div></div>
    <div class="sim-user-divider"></div>
    <div class="sim-user-note">👆 以上为本次模拟生成的虚拟用户，用于演示AI如何根据用户画像生成个性化文案。实际产品中将自动采集真实用户数据。</div>
  `;
}

function goHome() {
  document.getElementById('results').classList.remove('show');
  document.getElementById('profile').classList.remove('show');
  document.getElementById('simUser').classList.remove('show');
  document.getElementById('filterSection').style.display = 'none';
  document.getElementById('recSection').style.display = '';
  document.getElementById('userInput').value = '';
  document.getElementById('main').scrollTo({ top: 0, behavior: 'smooth' });
}

// ========== 推荐版块数据 ==========
const HOT_TOPICS = [
  { title: '#罗翔金句', heat: '8.2w赞', matchTags: ['#罗翔','#法律'], matchThemes: ['罗翔','法律','正义','认知','哲理'], matchText: ['罗翔'], src: 'xhs', timeFit: ['any'] },
  { title: '#罗振宇语录', heat: '5.1w赞', matchTags: ['#罗振宇','#得到'], matchThemes: ['罗振宇','终身学习','认知'], matchText: ['罗振宇'], src: 'weibo', timeFit: ['morning','afternoon','workday'] },
  { title: '#哲思语录', heat: '6.7w赞', matchTags: ['#哲思','#深度思考'], matchThemes: ['哲思','深度思考','格局'], matchText: ['哲思'], src: 'xhs', timeFit: ['evening','latenight'] },
  { title: '#名人名言', heat: '4.9w赞', matchTags: ['#名人名言','#金句'], matchThemes: ['名人','名言','智慧'], matchText: ['名人'], src: 'ted', timeFit: ['any'] },
  { title: '#读书笔记', heat: '5.5w赞', matchTags: ['#读书笔记','#读书感悟'], matchThemes: ['读书','笔记','感悟','阅读'], matchText: ['读书'], src: 'xhs', timeFit: ['evening','weekend','latenight'] },
  { title: '#认知升级', heat: '4.3w赞', matchTags: ['#认知升级','#思维'], matchThemes: ['认知','底层逻辑','深度思考'], matchText: ['认知'], src: 'douyin', timeFit: ['morning','afternoon','workday'] },
  { title: '#自律语录', heat: '7.1w赞', matchTags: ['#自律','#成长'], matchThemes: ['自律','成长','坚持','逆商'], matchText: ['自律'], src: 'xhs', timeFit: ['morning','daytime'] },
  { title: '#TED金句', heat: '3.8w赞', matchTags: ['#TED','#演讲'], matchThemes: ['TED','演讲','思维'], matchText: ['TED'], src: 'ted', timeFit: ['any'] },
  { title: '#颜文字', heat: '2.6w赞', matchTags: ['#颜文字','#emoji'], matchThemes: ['颜文字','创意'], matchText: ['颜文字'], src: 'xhs', timeFit: ['any'] },
  { title: '#深夜emo', heat: '6.0w赞', matchTags: ['#emo','#伤感'], matchThemes: ['emo','伤感','深夜'], matchText: ['emo'], src: 'xhs', timeFit: ['latenight','evening'] },
  { title: '#早安打卡', heat: '5.3w赞', matchTags: ['#早安','#元气'], matchThemes: ['早安','咖啡','元气'], matchText: ['早安'], src: 'xhs', timeFit: ['morning'] },
  { title: '#打工人日常', heat: '7.5w赞', matchTags: ['#打工人','#职场'], matchThemes: ['打工人','职场','摸鱼'], matchText: ['打工'], src: 'weibo', timeFit: ['workday','daytime'] },
  { title: '#周末快乐', heat: '4.8w赞', matchTags: ['#周末','#休闲'], matchThemes: ['周末','休闲','出游'], matchText: ['周末'], src: 'xhs', timeFit: ['weekend'] },
];

const REC_CATEGORIES = [
  { icon: '🧠', label: '哲思', matchTags: ['#哲思','#深度思考'], matchThemes: ['哲思','深度思考','格局'], timeFit: ['evening','latenight'] },
  { icon: '📖', label: '读书', matchTags: ['#读书笔记','#读书感悟'], matchThemes: ['读书','笔记','感悟','阅读'], timeFit: ['evening','weekend','latenight'] },
  { icon: '🎤', label: '演讲', matchTags: ['#TED','#演讲'], matchThemes: ['TED','演讲','罗翔','罗振宇'], timeFit: ['any'] },
  { icon: '💪', label: '自律', matchTags: ['#自律','#成长'], matchThemes: ['自律','成长','逆商','坚持'], timeFit: ['morning','daytime'] },
  { icon: '🌟', label: '名言', matchTags: ['#名人名言','#金句'], matchThemes: ['名人','名言','智慧'], timeFit: ['any'] },
  { icon: '🔮', label: '格局', matchTags: ['#格局','#底层逻辑'], matchThemes: ['格局','底层逻辑','思维'], timeFit: ['morning','afternoon','workday'] },
  { icon: '🌱', label: '成长', matchTags: ['#成长语录'], matchThemes: ['成长','终身成长','认知升级'], timeFit: ['any'] },
  { icon: '✨', label: '旅行感悟', matchTags: ['#旅行随感'], matchThemes: ['旅行','感悟'], timeFit: ['weekend','daytime'] },
  { icon: '🍔', label: '美食', matchTags: ['#美食'], matchThemes: ['美食','火锅','奶茶'], timeFit: ['noon','evening'] },
  { icon: '💼', label: '职场', matchTags: ['#职场','#打工人'], matchThemes: ['职场','打工人'], timeFit: ['workday','daytime'] },
  { icon: '😂', label: '搞笑', matchTags: ['#热梗','#搞笑'], matchThemes: ['搞笑','发疯'], timeFit: ['any'] },
  { icon: '❤️', label: '恋爱', matchTags: ['#想念','#恋爱'], matchThemes: ['恋爱','思念','甜蜜'], timeFit: ['evening','latenight'] },
  { icon: '☀️', label: '早安', matchTags: ['#早安'], matchThemes: ['早安','咖啡'], timeFit: ['morning'] },
  { icon: '🌙', label: '晚安', matchTags: ['#晚安'], matchThemes: ['晚安','深夜'], timeFit: ['latenight','evening'] },
  { icon: '😈', label: '颜文字', matchTags: ['#颜文字'], matchThemes: ['颜文字','创意'], timeFit: ['any'] },
  { icon: '😢', label: '深夜emo', matchTags: ['#emo','#伤感'], matchThemes: ['emo','伤感','失眠'], timeFit: ['latenight','evening'] },
  { icon: '🏃', label: '健身', matchTags: ['#健身','#运动'], matchThemes: ['健身','运动','跑步'], timeFit: ['morning','afternoon'] },
  { icon: '🎮', label: '游戏', matchTags: ['#游戏','#电竞'], matchThemes: ['游戏','电竞','开黑'], timeFit: ['evening','latenight','weekend'] },
];

const ALL_POPULAR_COPIES_HOT = [
  { tags: ['#罗翔','#法律人生','适合发圈｜认知觉醒'], text: '一个知识越贫乏的人，越是有一种莫名奇妙的勇气和自豪感。——罗翔', meta: '8.2w赞', hot: true, theme: '罗翔', src: 'xhs', updatedAt: '2026-03-17 12:00', timeFit: ['any'] },
  { tags: ['#罗翔','#人生哲理','适合思考时发｜灵魂拷问'], text: '人最大的痛苦，就是无法跨越"知道"和"做到"之间的鸿沟。——罗翔', meta: '6.5w赞', hot: true, theme: '认知', src: 'xhs', updatedAt: '2026-03-17 11:00', timeFit: ['any'] },
  { tags: ['#罗翔','#正义','适合发圈｜法律人温度'], text: '法律是对人最低的道德要求，如果一个人的道德标准就是合法，那这个人基本就是不道德的。——罗翔', meta: '7.1w赞', hot: true, theme: '正义', src: 'xhs', updatedAt: '2026-03-17 10:00', timeFit: ['any'] },
  { tags: ['#罗翔','#谦逊','适合自省时发｜保持敬畏'], text: '要珍惜那些能让你真正成长的痛苦，逃避痛苦只会带来更大的痛苦。——罗翔', meta: '5.8w赞', hot: true, theme: '哲理', src: 'xhs', updatedAt: '2026-03-17 09:00', timeFit: ['any'] },
  { tags: ['#罗振宇','#得到','适合职场发｜认知升级'], text: '你以为你是在对抗一个困难，其实你是在对抗一整个知识体系的空白。——罗振宇', meta: '5.1w赞', hot: true, theme: '罗振宇', src: 'weibo', updatedAt: '2026-03-17 12:00', timeFit: ['workday','morning','afternoon'] },
  { tags: ['#罗振宇','#终身学习','适合发圈｜学习动力'], text: '所谓终身学习，不是一直在学习，而是在每一个阶段都能找到属于自己的问题。——罗振宇', meta: '4.3w赞', hot: true, theme: '终身学习', src: 'weibo', updatedAt: '2026-03-17 11:00', timeFit: ['any'] },
  { tags: ['#罗振宇','#时间管理','适合早上发｜效率提升'], text: '所有的选择本质上都是时间的分配。你把时间花在哪里，人生就长成什么样子。——罗振宇', meta: '4.8w赞', hot: true, theme: '认知', src: 'weibo', updatedAt: '2026-03-17 10:00', timeFit: ['morning','workday'] },
  { tags: ['#哲思语录','#深度思考','适合深夜发｜灵魂独白'], text: '人不是因为变老了才停止追梦，而是因为停止追梦才变老的。', meta: '6.7w赞', hot: true, theme: '哲思', src: 'xhs', updatedAt: '2026-03-17 12:00', timeFit: ['evening','latenight'] },
  { tags: ['#哲思语录','#格局','适合独处时发｜格局打开'], text: '一个人的格局，决定了他的结局。你站在什么高度，就会看到什么风景。', meta: '4.9w赞', hot: true, theme: '格局', src: 'xhs', updatedAt: '2026-03-17 10:00', timeFit: ['any'] },
  { tags: ['#名人名言','#智慧','适合发圈｜经典传承'], text: '生活不是等待暴风雨过去，而是学会在雨中跳舞。——Vivian Greene', meta: '4.9w赞', hot: true, theme: '名人', src: 'ted', updatedAt: '2026-03-17 12:00', timeFit: ['any'] },
  { tags: ['#名人名言','#勇气','适合鼓励时发｜力量传递'], text: '你不能回到过去改变开头，但你可以从现在开始改变结局。——C.S. Lewis', meta: '4.2w赞', hot: true, theme: '名言', src: 'ted', updatedAt: '2026-03-17 11:00', timeFit: ['any'] },
  { tags: ['#读书笔记','#读书感悟','适合周末发｜书香气息'], text: '读书不是为了拿文凭或发大财，而是为了在面对荒凉的沙漠时，心中都能有一片绿洲。', meta: '5.5w赞', hot: true, theme: '读书', src: 'xhs', updatedAt: '2026-03-17 12:00', timeFit: ['evening','weekend','latenight'] },
  { tags: ['#认知升级','#底层逻辑','适合职场发｜思维突破'], text: '普通人改变结果，优秀的人改变原因，顶级的人改变思维模型。', meta: '4.3w赞', hot: true, theme: '底层逻辑', src: 'douyin', updatedAt: '2026-03-17 12:00', timeFit: ['workday','morning','afternoon'] },
  { tags: ['#逆商','#自律','适合低谷时发｜触底反弹'], text: '所有的逆袭，都是在你最想放弃的时候，再多坚持了一会儿。', meta: '7.1w赞', hot: true, theme: '逆商', src: 'xhs', updatedAt: '2026-03-17 12:00', timeFit: ['any'] },
  { tags: ['#自律语录','#成长','适合健身发｜自律宣言'], text: '自律不是做你想做的事，而是做你应该做的事，哪怕你不想做。', meta: '6.3w赞', hot: true, theme: '自律', src: 'xhs', updatedAt: '2026-03-17 11:00', timeFit: ['morning','daytime'] },
  { tags: ['#成长语录','#终身成长','适合发圈｜蜕变宣言'], text: '成长就是不断地跟旧的自己告别，然后在新的废墟上重建。', meta: '5.6w赞', hot: true, theme: '成长', src: 'xhs', updatedAt: '2026-03-17 10:00', timeFit: ['any'] },
  { tags: ['#TED','#演讲金句','适合分享时发｜灵感碰撞'], text: '脆弱不是弱点，脆弱是勇气的诞生地。——Brene Brown (TED)', meta: '3.8w赞', hot: true, theme: 'TED', src: 'ted', updatedAt: '2026-03-17 12:00', timeFit: ['any'] },
  { tags: ['#名人演讲','#毕业致辞','适合励志发｜经典回顾'], text: '求知若饥，虚怀若愚。Stay hungry, stay foolish.——Steve Jobs', meta: '8.5w赞', hot: true, theme: 'TED', src: 'ted', updatedAt: '2026-03-17 10:00', timeFit: ['any'] },
  { tags: ['#旅行随感','#人生感悟','适合旅行发｜诗与远方'], text: '旅行的意义不在于到达了多远的地方，而在于在路上你遇见了什么样的自己。', meta: '4.1w赞', hot: true, theme: '旅行', src: 'xhs', updatedAt: '2026-03-17 12:00', timeFit: ['weekend','daytime'] },
  { tags: ['#颜文字','#可爱','适合表白发｜颜文字告白'], text: '⣠⠛⠛⣄⣠⠶⠛⠛⠛⠶⣄⣠⠛⠛⣄\n⢿\u3000 ⠋\u3000\u3000\u3000\u3000 \u3000⠙\u3000 ⡿\n   ⣾\u3000  ♥︎ ᴥ ♥︎\u3000   ⣷\n   ⠻⣄\u3000             ⣠⠟\n     ⣠⡿       🎀         ⢿⣄\n    ⠙⠛⠋                 ⠙⠛⠋\n  ⢿⣀⣀⡿ ⢿⣀⣀⡿', meta: '2.6w赞', hot: true, theme: '颜文字', src: 'xhs', updatedAt: '2026-03-17 12:00', timeFit: ['any'] },
  { tags: ['#深夜emo','#伤感','适合深夜发｜情绪出口'], text: '有些话，说给月亮听就好了。反正它不会回答，也不会转告。', meta: '5.2w赞', hot: true, theme: 'emo', src: 'xhs', updatedAt: '2026-03-17 23:00', timeFit: ['latenight','evening'] },
  { tags: ['#早安','#元气','适合早上发｜开启美好一天'], text: '新的一天，新的开始。阳光温暖，微风不燥，一切都在变好的路上。早安。', meta: '5.3w赞', hot: true, theme: '早安', src: 'xhs', updatedAt: '2026-03-17 07:00', timeFit: ['morning'] },
  { tags: ['#打工人','#摸鱼','适合工作日发｜打工人共鸣'], text: '上班如上坟，但坟头蹦迪的是我本人💀 下班倒计时开始！', meta: '6.8w赞', hot: true, theme: '打工人', src: 'weibo', updatedAt: '2026-03-17 14:00', timeFit: ['workday','daytime'] },
];

const ALL_POPULAR_COPIES_NORMAL = [
  { tags: ['#罗翔','#谦逊','适合自省发'], text: '我们登上并非我们所选择的舞台，演出并非我们所选择的剧本。——罗翔', meta: '3.5w人使用', theme: '罗翔', timeFit: ['any'] },
  { tags: ['#罗翔','#自由','适合发圈'], text: '真正的自由不是随心所欲，而是自我主宰。——罗翔', meta: '3.1w人使用', theme: '罗翔', timeFit: ['any'] },
  { tags: ['#罗翔','#勇气','适合鼓励朋友发'], text: '人生唯一确定的，就是不确定的人生。所以，勇敢地去选择吧。——罗翔', meta: '2.8w人使用', theme: '罗翔', timeFit: ['any'] },
  { tags: ['#罗振宇','#做事','适合工作发'], text: '做事的人永远不会饿死，因为他们总能从行动中找到机会。——罗振宇', meta: '2.9w人使用', theme: '罗振宇', timeFit: ['workday','daytime'] },
  { tags: ['#罗振宇','#连接','适合社交发'], text: '这个时代最稀缺的能力，不是什么都会，而是能把不同的知识连接起来。——罗振宇', meta: '2.5w人使用', theme: '罗振宇', timeFit: ['any'] },
  { tags: ['#哲理文案','#人生','适合发圈'], text: '人生没有白走的路，每一步都算数。你以为的弯路，可能是最近的路。', meta: '4.2w人使用', theme: '哲理', timeFit: ['any'] },
  { tags: ['#哲理文案','#选择','适合纠结时发'], text: '人生最大的遗憾不是做错了什么，而是在犹豫中错过了什么。', meta: '3.8w人使用', theme: '哲思', timeFit: ['any'] },
  { tags: ['#哲理文案','#时间','适合深夜发'], text: '时间不语，却回答了所有问题；时光不言，却见证了所有答案。', meta: '3.5w人使用', theme: '深度思考', timeFit: ['evening','latenight'] },
  { tags: ['#格局','#底层逻辑','适合职场发'], text: '普通人看到的是问题，高手看到的是系统。改变一个节点，不如升级整个框架。', meta: '3.0w人使用', theme: '格局', timeFit: ['workday','morning','afternoon'] },
  { tags: ['#底层逻辑','#思维方式','适合发圈'], text: '决定人生高度的，不是你的能力，而是你的认知边界。打破它，世界就不一样了。', meta: '2.7w人使用', theme: '底层逻辑', timeFit: ['any'] },
  { tags: ['#思维方式','#深度思考','适合阅读发'], text: '深度思考比勤奋工作更重要。方向错了，越努力越尴尬。', meta: '2.4w人使用', theme: '思维', timeFit: ['any'] },
  { tags: ['#终身成长','#复利','适合早上发'], text: '每天进步1%，一年后你就是37倍的自己。复利不只是金融概念，更是人生哲学。', meta: '2.9w人使用', theme: '成长', timeFit: ['morning'] },
  { tags: ['#逆商','#低谷','适合困难时发'], text: '低谷不是终点，是蓄力的起点。弹簧被压得越低，弹得越高。', meta: '3.6w人使用', theme: '逆商', timeFit: ['any'] },
  { tags: ['#自律','#习惯','适合打卡发'], text: '自律的前28天是地狱，之后就是天堂。把痛苦的事变成习惯，习惯就不再痛苦。', meta: '4.0w人使用', theme: '自律', timeFit: ['morning','daytime'] },
  { tags: ['#自律','#清醒','适合发圈'], text: '保持自律的方法很简单：想想你最怕变成的样子，然后反着来。', meta: '3.4w人使用', theme: '自律', timeFit: ['any'] },
  { tags: ['#TED','#幸福','适合发圈'], text: '幸福不是一个目标，而是副产品。全身心投入有意义的事情中，幸福自然来找你。——TED', meta: '2.5w人使用', theme: 'TED', timeFit: ['any'] },
  { tags: ['#名人演讲','#坚持','适合低谷发'], text: '成功不是最终的，失败不是致命的，重要的是继续下去的勇气。——丘吉尔', meta: '2.8w人使用', theme: '演讲', timeFit: ['any'] },
  { tags: ['#读书感悟','#阅读','适合周末发'], text: '读书越多，越发现自己的无知。这种无知感，恰恰是成长的开始。', meta: '2.6w人使用', theme: '读书', timeFit: ['evening','weekend'] },
  { tags: ['#读书笔记','#书评','适合分享发'], text: '一本书改变不了世界，但可以改变一个人。一个被改变的人，可以改变世界。', meta: '2.3w人使用', theme: '笔记', timeFit: ['any'] },
  { tags: ['#旅行随感','#在路上','适合旅行发'], text: '最好的风景永远在下一个转角。走过的路都是积累，看过的风景都是收获。', meta: '2.4w人使用', theme: '旅行', timeFit: ['weekend','daytime'] },
  { tags: ['#人生感悟','#释然','适合发圈'], text: '人生最大的自由，是放下对"标准答案"的执念。允许自己走弯路，弯路上也有风景。', meta: '2.9w人使用', theme: '人生', timeFit: ['any'] },
  { tags: ['#早安','#元气满满','适合早上发圈'], text: '当你决定要出发时，最艰难的部分就已经结束了。早安，今天也要顺利。', meta: '4.1w人使用', theme: '早安', timeFit: ['morning'] },
  { tags: ['#晚安','#治愈','适合睡前发圈'], text: '今天的烦恼就到此为止啦，明天依旧光芒万丈✨ 晚安！', meta: '3.9w人使用', theme: '晚安', timeFit: ['latenight','evening'] },
  { tags: ['#热梗','#00后','适合聊天接话发'], text: '确诊为：没有周末就会碎掉的脆皮打工人💀', meta: '4.5w人使用', theme: '搞笑', timeFit: ['workday'] },
  { tags: ['#打工人','#吗喽','适合上班摸鱼发'], text: '私密马赛，吗喽这就去改。', meta: '3.5w人使用', theme: '打工人', timeFit: ['workday','daytime'] },
  { tags: ['#好运','#发财','适合新年发圈'], text: '「一切·順利」𝐘𝐞𝐞𝐞𝐞 ✌︎', meta: '4.0w人使用', theme: '好运', timeFit: ['any'] },
  { tags: ['#想念','#温暖','适合降温天发'], text: '今天降温了，突然有点想吃家里做的饭了，你们在家注意保暖哦。', meta: '3.3w人使用', theme: '思念', timeFit: ['evening','latenight'] },
  { tags: ['#治愈','#坚持','适合发圈'], text: '那些看似不起波澜的日复一日，会在某天让你看到坚持的意义。', meta: '3.2w人使用', theme: '坚持', timeFit: ['any'] },
  { tags: ['#励志','#正能量','适合发圈'], text: '你现在的努力，是未来的你在向过去的自己说谢谢。', meta: '2.6w人使用', theme: '励志', timeFit: ['morning','daytime'] },
  { tags: ['#美食','#干饭人','适合晒美食发圈'], text: '人生苦短，甜品要趁热吃，奶茶要加冰，烧烤要加辣。', meta: '2.3w人使用', theme: '美食', timeFit: ['noon','evening'] },
  { tags: ['#恋爱','#甜蜜','适合秀恩爱发'], text: '遇见你之后，全世界都变成了背景板。', meta: '2.8w人使用', theme: '恋爱', timeFit: ['evening','latenight'] },
  { tags: ['#发疯文学','#精神状态','适合emo时发'], text: '我的精神状态：( ᵒ̴̶̷̥́ ᵒ̴̶̷̣̥̀ ) -> (ง •̀•́)ง -> ( ╯-_-)╯┴—┴ -> ( 🛌 )', meta: '4.3w人使用', theme: '发疯', timeFit: ['latenight','evening'] },
  { tags: ['#emoji','#梦幻','适合配图发圈'], text: '🎟˚⟢ 𝑯𝒂𝒗𝒆 𝒂 𝒏𝒊𝒄𝒆 𝒅𝒂𝒚 🛳️', meta: '2.4w人使用', theme: '创意', timeFit: ['any'] },
  { tags: ['#深夜emo','#失眠','适合凌晨发'], text: '凌晨三点的城市，只有路灯还记得我。', meta: '3.1w人使用', theme: 'emo', timeFit: ['latenight'] },
  { tags: ['#深夜emo','#孤独','适合深夜发'], text: '白天的我嘻嘻哈哈，深夜的我独自对话。', meta: '2.9w人使用', theme: 'emo', timeFit: ['latenight','evening'] },
  { tags: ['#周末','#躺平','适合周末发'], text: '周末的正确打开方式：睡到自然醒，吃到扶墙走。', meta: '3.7w人使用', theme: '周末', timeFit: ['weekend'] },
  { tags: ['#健身','#晨跑','适合运动打卡发'], text: '今天的汗水，是明天的勋章。跑起来，世界都不一样了。', meta: '2.2w人使用', theme: '健身', timeFit: ['morning','afternoon'] },
];

// ========== 自动填充时间戳 ==========
(function(){
  const base = new Date(); base.setMinutes(0,0,0);
  ALL_POPULAR_COPIES_HOT.forEach((c,i) => { if(!c.updatedAt){const t=new Date(base.getTime()-(i%6)*3600000);c.updatedAt=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')} ${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;}});
  ALL_POPULAR_COPIES_NORMAL.forEach((c,i) => { if(!c.updatedAt){const h=Math.floor(i/3)+1;const t=new Date(base.getTime()-h*3600000);c.updatedAt=`${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')} ${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}`;}});
})();

function formatFreshness(d) {
  if(!d) return '';
  const diff = Date.now() - new Date(d.replace(' ','T')).getTime();
  const m = Math.floor(diff/60000);
  if(m<1) return '刚刚更新'; if(m<60) return `${m}分钟前更新`;
  const h = Math.floor(m/60); if(h<24) return `${h}小时前更新`;
  const dd = Math.floor(h/24); if(dd<7) return `${dd}天前更新`;
  return d.slice(5,16)+'更新';
}

// ========== 穿插算法 ==========
function buildShuffledCopies() {
  const hotByKey = {};
  ALL_POPULAR_COPIES_HOT.forEach(c => { const k=c.text.slice(0,15); if(!hotByKey[k]) hotByKey[k]=[]; hotByKey[k].push(c); });
  const keys=Object.keys(hotByKey), hotS=[];
  let more=true;
  while(more){more=false;for(const k of keys){if(hotByKey[k].length){hotS.push(hotByKey[k].shift());more=true;}}}
  const normS=[...ALL_POPULAR_COPIES_NORMAL].sort(()=>Math.random()-.5);
  const result=[];
  for(let i=0;i<normS.length;i++){result.push({...hotS[i%hotS.length]});result.push(normS[i]);}
  // 去重检查
  for(let i=1;i<result.length;i++){
    const ws=Math.max(0,i-9),wi=result.slice(ws,i),wt=wi.map(x=>x.theme);
    if(wt.includes(result[i].theme)){for(let j=i+1;j<Math.min(i+30,result.length);j++){if(!wt.includes(result[j].theme)){[result[i],result[j]]=[result[j],result[i]];break;}}}
  }
  // 按时间适配度排序：适合当前时段的排前面，不适合的排后面（但不完全隐藏）
  const fitItems = result.filter(c => isTimeFit(c.timeFit));
  const unfitItems = result.filter(c => !isTimeFit(c.timeFit));
  return [...fitItems, ...unfitItems];
}

const ALL_POPULAR_COPIES = buildShuffledCopies();
const POP_PAGE_SIZE = 10;
let popPage = 0;

// ========== 克隆生成 ==========
const CLONE_TEMPLATES = {
  '罗翔':[
    '承认自己的无知，是智慧的开端。——罗翔','人不能成为欲望的奴隶，要学会在诱惑面前保持清醒。——罗翔',
    '当你觉得自己很了不起的时候，就去看看浩瀚星空。——罗翔','一个人最大的敌人，就是他自己的偏见。——罗翔',
    '法律的生命在于经验，不在于逻辑。——罗翔','人应当有仰望星空的权利，也应当有脚踏实地的能力。——罗翔',
    '自以为是是人类最大的毛病。——罗翔','对别人最大的善意，就是对自己最严格的要求。——罗翔',
    '永远不要用你的标准去衡量别人的人生。——罗翔','读书是一种抵抗虚无的方式。——罗翔',
    '勇敢不是没有恐惧，而是心怀恐惧依然前行。——罗翔','真正的教育不是灌满一桶水，而是点燃一把火。——罗翔',
    '越是知道的多，越是觉得自己无知。——罗翔','正义可能会迟到，但永远不会缺席。——罗翔',
    '我们要对未知保持敬畏，对已知保持谦卑。——罗翔','人生不是一场赛跑，而是一次旅行。——罗翔',
    '没有人可以为你定义你的人生。——罗翔','善良是一种选择，而非本能。——罗翔',
    '知道与做到之间，隔着一个行动。——罗翔','不要因为走得太远，而忘了为什么出发。——罗翔',
    '每个人都在自己的时区里成长。——罗翔','面对诱惑的时候，要问自己配不配。——罗翔',
    '自以为义比自以为非更可怕。——罗翔','真正的强大是内心的平静。——罗翔',
    '学习的意义在于让你有更多选择。——罗翔','如果你觉得读书没用，那是因为你读的太少了。——罗翔',
    '人要有批判性思维，不要人云亦云。——罗翔','做人最重要的是保持善良。——罗翔',
    '我们需要的不是确定的答案，而是思考的能力。——罗翔','知识的真正价值在于运用。——罗翔',
    '成熟不是变得圆滑，而是学会了理解。——罗翔','每个人都是独特的个体，不要轻易评判。——罗翔',
    '我们所拥有的一切都只是暂时的保管。——罗翔','幸福不是拥有的多，而是计较的少。——罗翔',
    '痛苦是成长的催化剂。——罗翔','做一个有温度的人比做一个有成绩的人更重要。——罗翔',
    '人最珍贵的是时间，最浪费的也是时间。——罗翔','不要在最好的年纪做最懒的自己。——罗翔',
    '无知不是错，不愿学习才是错。——罗翔','人生苦短，要做有意义的事。——罗翔',
    '你以为的极限，只是别人的起点。——罗翔','生活教会我们的，远比课堂多。——罗翔',
    '一个人的格局，藏在他读过的书里。——罗翔','认真活着本身就是一种勇敢。——罗翔',
    '人活着要有光，自己是光，照亮别人也是光。——罗翔','我们终将成为自己曾经讨厌的那种人，也许这就是成长。——罗翔',
    '温柔是一种被低估的力量。——罗翔','不要让自己的人生变成别人的复制品。——罗翔',
    '谦逊是智慧的起点，傲慢是无知的终点。——罗翔',
  ],
  '罗振宇':[
    '知识不是力量，使用知识才是力量。——罗振宇','每个人都是自己时间的CEO。——罗振宇',
    '与其抱怨时代，不如成为时代需要的人。——罗振宇','我们不缺好主意，缺的是去做的勇气。——罗振宇',
    '这个时代最值钱的东西是注意力。——罗振宇','所有的焦虑都来自于"想太多做太少"。——罗振宇',
    '真正的学习是把知识变成行动。——罗振宇','一个人最大的竞争力是学习能力。——罗振宇',
    '碎片化学习不是问题，问题是没有体系。——罗振宇','做时间的朋友，让复利为你工作。——罗振宇',
    '你花时间的方式，就是你塑造自己的方式。——罗振宇','在信息爆炸时代，筛选比获取更重要。——罗振宇',
    '不要试图说服别人，要用行动影响别人。——罗振宇','好奇心是终身学习的发动机。——罗振宇',
    '真正的努力不是感动自己，而是产生结果。——罗振宇','解决问题的最好方式是升级自己。——罗振宇',
    '长期主义是最好的人生策略。——罗振宇','做一个长期有耐心的人。——罗振宇',
    '知识的护城河永远不会过时。——罗振宇','我们与世界的关系，取决于我们对世界的理解。——罗振宇',
    '不要用战术上的勤奋来掩盖战略上的懒惰。——罗振宇','活到老学到老不是鸡汤，是生存策略。——罗振宇',
    '在不确定中寻找确定性。——罗振宇','你想要的生活，需要你自己去构建。——罗振宇',
    '工作的本质是解决问题。——罗振宇','把简单的事做到极致就是绝招。——罗振宇',
    '持续输出是最好的输入方式。——罗振宇','做自己的产品经理。——罗振宇',
    '连接是这个时代最大的红利。——罗振宇','先完成，再完美。——罗振宇',
    '用系统思维看世界，用执行力改变世界。——罗振宇','时间花在哪里，成就就在哪里。——罗振宇',
    '别怕犯错，怕的是不敢试错。——罗振宇','不要让舒适区成为你的天花板。——罗振宇',
    '眼界决定你能看到什么，行动决定你能得到什么。——罗振宇','世界上最划算的投资是投资自己。——罗振宇',
    '真正的自由来自于能力的积累。——罗振宇','做事的人运气都不会太差。——罗振宇',
    '你的问题，就是你成长的空间。——罗振宇','人生没有白走的路，每一步都有意义。——罗振宇',
    '与其等风来，不如自己造风。——罗振宇','思考的深度决定行动的高度。——罗振宇',
    '真正厉害的人，都是终身学习者。——罗振宇','用确定的努力，对抗不确定的世界。——罗振宇',
    '时间是检验一切的标准。——罗振宇','向死而生，方能全力以赴。——罗振宇',
    '不断迭代自己，才能跟上时代。——罗振宇','少说多做，用结果说话。——罗振宇',
    '知行合一才是真正的智慧。——罗振宇',
  ],
  '哲思':[
    '最深刻的真理，往往藏在最简单的句子里。','世界是一面镜子，你笑它就笑，你哭它就哭。',
    '有些答案，只有当你停止寻找的时候才会出现。','人生的意义不在于活了多少天，而在于有多少天是有意义的。',
    '越是简单的道理，越需要一生去领悟。','不要用别人的地图，来找自己的路。',
    '沉默不是空白，是思考的留白。','你以为的尽头，往往是新的起点。',
    '真正的智慧是知道自己不知道什么。','世间万物，各有归期，别着急，别迟暮。',
    '你看到的世界，取决于你内心的滤镜。','当你不再追逐光的时候，你会发现自己就是光。',
    '简单是复杂的最高形式。','人生本无意义，你赋予它什么意义，它就有什么意义。',
    '不是世界太吵，是你的内心不够安静。','接受不完美，是通往完整的道路。',
    '万物有裂缝，那是光进来的地方。','存在本身就是一种奇迹。',
    '生活不是问题的总和，而是体验的集合。','每一次呼吸都是重新开始的机会。',
    '我们无法选择生活给予我们什么，但可以选择如何面对。','知足不是不进取，而是懂得感恩。',
    '真正的平静不是远离喧嚣，而是内心的笃定。','花开不是为了落，而是为了绽放那一刻。',
    '人最终要学会的，是与自己和解。','你以为失去的，其实从未真正属于你。',
    '人的一生就是在不断成为自己的过程中。','迷茫本身就是成长的一部分。',
    '放下执念，不是放弃，而是拥抱更广阔的可能。','比起到达终点，路上的风景更值得珍惜。',
    '时间从不说谎，它默默验证一切。','自由不是想做什么就做什么，而是不想做什么就可以不做什么。',
    '人活着的意义，就在于寻找意义本身。','孤独不是被遗忘，而是选择与自己共处。',
    '生命短暂，但足够你成为你想成为的人。','变化是唯一不变的事情。',
    '不要因为赶路太快，而忘了欣赏日落。','每一段沉默都在酝酿一次爆发。',
    '真理往往在极端之间的中间地带。','你今天种下的种子，终有一天会长成森林。',
    '认清生活的真相后，依然热爱生活。——罗曼·罗兰','人生不如意十之八九，可与人言无二三。',
    '凡事发生必有其利。','走着走着就会发现，路是走出来的，不是想出来的。',
    '不和别人比较，只和昨天的自己比较。','对抗虚无的最好方式，就是认真活好每一天。',
    '懂得放手，是另一种形式的拥有。','静水流深，言不必多。',
    '每个当下，都是最好的时光。','命运负责洗牌，但玩牌的是你自己。',
    '人生没有标准答案，只有参考答案。','所有的遇见，都是久别重逢。',
  ],
  '格局':[
    '格局越大，越不纠缠。','你的对手不是别人，是昨天的自己。',
    '站得高看得远，但首先你得愿意往上爬。','格局决定结局，眼界决定境界。',
    '不要在小事上消耗自己的能量。','大事难事看担当，逆境顺境看胸怀。',
    '真正的高手，都在暗处努力。','少与人争，多与己斗。',
    '做大事的人，从不在小事上计较。','你的格局，就是你的结局。',
    '不是位置决定格局，而是格局决定位置。','把时间花在抱怨上，不如花在行动上。',
    '别人的成功不会影响你的进度。','人生最大的对手是自己的局限。',
    '胸怀有多宽，路就有多宽。','大格局的人，总是在为未来投资。',
    '不要让情绪消耗你的判断力。','视野有多大，世界就有多大。',
    '强者从不解释，只用结果说话。','看问题的角度，决定你能走多远。',
    '人生就是不断升级认知的过程。','赢在格局，败在计较。',
    '与其互相消耗，不如各自成长。','格局大了，委屈就小了。',
    '你能容纳多少，就能成就多少。','小胜靠智，大胜靠德。',
    '永远不要和层次不同的人争论。','能吃亏的人，终究不会吃亏。',
    '沉淀下来的，才是你的底蕴。','世界很大，不要在一棵树上吊死。',
    '别让今天的情绪毁了明天的格局。','抬头看路，比低头走路更重要。',
    '做人最高级的智慧，是不和烂事纠缠。','凡是让你生气的事，说明你还不够强大。',
    '有格局的人，心中装的是星辰大海。','赢了道理，输了关系，不值得。',
    '比起输赢，更重要的是成长。','格局不是装出来的，是经历磨出来的。',
    '高手都在做选择题，庸人都在做判断题。','有些事放一放，比争一争更有用。',
    '不是所有的鱼都在同一片海里。','吞下了委屈，喂大了格局。',
    '真正的格局是：眼中有大局，心中有他人。','大智若愚，大巧若拙。',
    '不争一时之长短，要看一世之远近。','大事看能力，小事看品格。',
    '把精力集中在能改变的事情上。','改变能改变的，接受不能改变的，这就是格局。',
    '世事如棋，有格局的人才能走好每一步。',
  ],
  '自律':[
    '自律是通往自由的唯一道路。','每一个优秀的人，都有一段沉默的时光。',
    '当你想放弃的时候，想想为什么开始。','自律的本质是对未来自己的投资。',
    '你今天的选择，决定了明天的生活。','不需要别人监督的努力，才是真正的自律。',
    '坚持做难而正确的事。','早起是自律最简单的开始。',
    '你的身体是你唯一的住所，好好照顾它。','自律给我自由，运动给我力量。',
    '日拱一卒，功不唐捐。','把每一天都当成最后一天来过。',
    '好习惯不是一天养成的，但一天不坚持就可能丢掉。','真正的努力，不需要发朋友圈。',
    '你有多自律，就有多自由。','没有人能叫醒一个装睡的人，但闹钟可以。',
    '今天不想跑，所以才去跑。——村上春树','少说多做，埋头赶路。',
    '自律是成为更好自己的阶梯。','控制不住嘴，就管不住人生。',
    '延迟满足，是成年人的必修课。','每天做一件不想做但应该做的事。',
    '优秀是一种习惯，而非一次行为。','当自律成为本能，成功就成为必然。',
    '不要用短期的舒适换长期的痛苦。','时间花在哪里，你的人生就在哪里。',
    '真正的自律从作息开始。','做自己害怕做的事，害怕就会消失。',
    '别人在看剧的时候，你在看书；别人在刷手机的时候，你在运动。差距就是这么产生的。',
    '管好自己，是对世界最好的贡献。','三分钟热度的人永远体会不到坚持的快乐。',
    '你不需要很厉害才能开始，但你需要开始才能变得厉害。','天赋决定上限，自律决定下限。',
    '每天进步一点点，量变终将质变。','自律不是苦行僧，是选择更好的生活方式。',
    '起床的动力：不想让未来的自己失望。','坚持运动的人，时间不会亏待你。',
    '没有白费的汗水，也没有白走的路。','把痛苦变成习惯，把习惯变成力量。',
    '每一次拒绝诱惑，都是一次小小的胜利。','自律的人不一定成功，但成功的人一定自律。',
    '不是因为看到希望才坚持，而是坚持了才能看到希望。','生活不会辜负每一个努力的人。',
    '咬牙坚持的每一天，都在拉开你和别人的差距。','最好的投资就是投资自己。',
    '自律的日子虽然枯燥，但回头看全是风景。','别等到要用的时候，才后悔当初没有坚持。',
    '持续做正确的事，即使短期看不到回报。','五年后你会感谢今天自律的自己。',
    '清醒的人都在默默努力。',
  ],
  '读书':[
    '书读百遍其义自见。读书的意义在于让你即使身处泥泞也能仰望星空。','阅读是最低成本的自我增值方式。',
    '好书如挚友，越读越深越不舍。','读书是与最伟大的灵魂对话。',
    '你读过的书，会变成你身体的一部分。','读书不是为了考试，是为了遇见更好的自己。',
    '一个人的气质里，藏着他读过的书。','读书使人充实，讨论使人机智，写作使人精确。——培根',
    '没有读不完的书，只有不想读的心。','世界上最便宜的旅行方式就是读书。',
    '翻开一本书，就是打开一扇通往新世界的门。','好的文字像镜子，照见你自己。',
    '读书让你在独处时不孤单。','今天读的每一页，都是明天的铠甲。',
    '博览群书是培养格局的最好方式。','不读书的人，看到的世界只有眼前。',
    '书中不一定有黄金屋，但一定有更广阔的视野。','读书不是为了反驳别人，而是为了理解世界。',
    '安静地读书，是这个浮躁时代最奢侈的事。','每一本书都是一段压缩的人生经验。',
    '读书使人谦逊，因为你知道了更多的未知。','开卷有益，闭卷有思。',
    '最好的投资品不是股票和房产，是书本和大脑。','读一本好书，如交一个益友。',
    '把读书当成呼吸一样自然。','读书的人，灵魂永远在路上。',
    '年轻时读的书，决定了你中年的样子。','读了万卷书的人，心里有一片海。',
    '读不懂的书，过几年再读就懂了。这就是成长。','纸质书的翻页声，是世界上最安静的音乐。',
    '书架上的每一本书，都是过去的自己留给现在的礼物。','周末最好的安排：一杯咖啡，一本好书。',
    '在书里找到共鸣，比在人群中找到知己更容易。','每天哪怕只读10页，一年也能读完十几本书。',
    '读书多了，容颜自然改变。——三毛','书是随时可以打开的精神避难所。',
    '好书值得反复读，每次都有新发现。','别人推荐的书不一定适合你，自己发现的才最珍贵。',
    '读完一本书的满足感，胜过刷一晚上手机。','知识不会辜负你，但你可能会辜负知识。',
    '如果你不知道做什么，那就去读书吧。','读书让你拥有选择的权利。',
    '学海无涯，但每一步都值得。','一本书可能改变一个人的命运。',
    '生活已经够忙了，但读书是忙中偷闲的智慧。','读书人的浪漫：与古今中外的思想家对话。',
    '越读越觉得自己渺小，越渺小越想继续读。','把手机放下，拿起一本书，试试看。',
    '你的书单，就是你的灵魂自画像。',
  ],
  '逆商':[
    '真正的强者不是没有眼泪，而是含着泪依然在奔跑。','困难是成长的催化剂，逆境是最好的老师。',
    '每一次挫折都是化了妆的祝福。','低谷是为了让你看清谁在你身边。',
    '伤疤是战士的勋章。','在最黑暗的时候，记得抬头看星星。',
    '跌倒了不可怕，可怕的是不敢站起来。','打不倒你的，终将使你更强大。——尼采',
    '逆风的方向，更适合飞翔。','没有过不去的坎，只有过不去的心。',
    '凤凰涅槃之前，必经烈火焚身。','把眼泪流完了，就用微笑上场。',
    '生活给了你一个柠檬，就做一杯柠檬水。','触底反弹，是最有力量的姿态。',
    '绝境中的人，比谁都更渴望光。','每一次失败都是接近成功的一步。',
    '暴风雨过后的彩虹最美。','你觉得你已经到了极限，但其实你还有余力。',
    '被生活按在地上摩擦的人，反弹力最强。','冬天来了，春天还会远吗？',
    '你以为的末路，其实是转弯的路口。','在困难面前，选择坚持本身就是一种胜利。',
    '世界以痛吻我，我却报之以歌。——泰戈尔','人在绝境中才能激发最大的潜能。',
    '你现在承受的，都会变成你未来的养分。','苦难是命运的礼物，只是包装太丑了。',
    '别急，属于你的好运正在路上。','没有什么是永恒的，包括低谷。',
    '有时候后退一步，是为了更好地向前。','黎明前的黑暗最深沉。',
    '经历过风雨的花，开得最灿烂。','不被定义，不被打败。',
    '你今天流的泪，是明天回忆里的微笑。','大雨过后，地面更坚实。',
    '把绊脚石变成垫脚石。','每一次跌倒都是一次学习。',
    '苦难是化了妆的天使。','不顺利的日子里，要对自己说：没关系，会好的。',
    '最难走的路往往通向最美的风景。','你比你想象的更坚强。',
    '那些杀不死我的，只会让我更强大。','在泥泞中前行的人，注定看到不一样的风景。',
    '人生没有白受的苦，每一段经历都有意义。','即使在最低谷，也要保持向上看的姿态。',
    '你今天的困难，是未来你讲述传奇的素材。','强者不是没有低谷，而是从不停留在低谷。',
    '一切都是暂时的，好的坏的都会过去。','经历过最冷的冬天，才最懂春天的珍贵。',
    '这世上没有绝望的处境，只有对处境绝望的人。',
  ],
  'TED':[
    '你的时间有限，不要为别人而活。——Steve Jobs','真正的教育是点燃内心的火焰。——苏格拉底',
    '勇气是所有美德的基础。——Maya Angelou','改变世界的不是科技，而是科技背后的人。——TED',
    '最成功的人不是从不失败的人，而是从不放弃的人。——TED','创造力就是把不相关的事物联系起来。——Steve Jobs',
    '你不需要看到整个楼梯，只需要迈出第一步。——Martin Luther King Jr.',
    '做你自己，因为别的角色都有人演了。——Oscar Wilde','生命中最大的冒险是从不冒险。——Mark Zuckerberg',
    '成功不是关于你拥有什么，而是关于你成为了谁。——TED','最好的领导者是让别人觉得自己很重要的人。——TED',
    '连接你生命中的点，只有回顾时才能看到。——Steve Jobs','学习不是通往目的地的工具，学习本身就是旅程。——TED',
    '脆弱不是弱点，而是我们衡量勇气的方式。——Brene Brown','做你热爱的事，成功只是副产品。——TED',
    '简洁是终极的复杂。——Leonardo da Vinci','你能想象的一切都是真实的。——Pablo Picasso',
    '不要问这个世界需要什么，问自己什么让你充满活力。——Howard Thurman','每个专家都曾是初学者。——Helen Hayes',
    '唯一做出伟大工作的方式是热爱你所做的。——Steve Jobs','如果你想走得快，一个人走；如果你想走得远，一群人走。——非洲谚语',
    '教育不是装满一桶水，而是点燃一把火。——William Butler Yeats','最好的预测未来的方式是创造未来。——Peter Drucker',
    '我们最大的恐惧不是我们不够好，而是我们光芒万丈。——Marianne Williamson',
    '行动是治愈恐惧的良药。——Dale Carnegie','一个人看世界的方式，决定了他的世界。——TED',
    '真正的幸福不来自于得到更多，而来自于给予更多。——TED','不要让恐惧决定你的命运。——TED',
    '每一个成功的人背后，都有无数个失败的故事。——TED','人类最大的成就往往来自最大的困境。——TED',
    '好奇心是人类最强大的驱动力。——TED','最有创造力的人，是那些敢于犯错的人。——TED',
    '同理心是改变世界的最强武器。——TED','不要追逐成功，追逐卓越，成功会自然跟随。——TED',
    '每一段旅程都始于一个勇敢的决定。——TED','你不必很伟大才能开始，但你需要开始才能变得伟大。——TED',
    '知识就是力量，但善用知识才是超能力。——TED','世界变好的方式：每个人都做好自己那部分。——TED',
    '保持饥饿，保持愚蠢，保持学习。——TED精神','听别人的故事，是理解这个世界最快的方式。——TED',
    '创新不是发明新东西，而是用新的方式看旧东西。——TED','真正的影响力来自于真实和诚恳。——TED',
    '未来属于那些学会与不确定性共舞的人。——TED',
  ],
  '治愈':[
    '世界偶尔冷漠，但总有一束光是为你留的。','没关系的，一切都会慢慢好起来。',
    '你是自己的英雄，请记得给自己鼓掌。','允许自己不完美，也是一种温柔。',
    '你已经很棒了，别对自己太苛刻。','在最难的时候，给自己一个拥抱吧。',
    '一切都会过去的，好的会留下。','慢慢来，比较快。',
    '今天过得不好也没关系，明天又是新的开始。','你值得被温柔以待。',
    '即使没有掌声，也要认真表演。','太阳每天都是新的，你也是。',
    '不需要很好，只需要真实就好。','你的存在本身就是有意义的。',
    '给自己一杯热茶，给世界一个微笑。','雨后总会有晴天，冬天过后是春天。',
    '你是这个世界上独一无二的存在。','不要急，面包会有的，牛奶也会有的。',
    '坏日子总会过去，好运正在路上。','你的笑容，是这个世界最好的风景。',
    '即使生活很难，也要保持柔软。','每一个平凡的日子都值得被珍惜。',
    '你今天有好好吃饭吗？记得照顾好自己哦。','不完美的日子里，也有完美的瞬间。',
    '安静地喝一杯水，感受此刻的平静。','世界虽大，但总有一个角落为你留着。',
    '你不需要每天都很坚强。','有些美好，就藏在日常的细微处。',
    '风会把你吹到该去的地方。','被遗忘的角落里，也会开出花。',
    '你已经走了很远了，停下来歇歇也可以。','没有永远的黑夜，天总会亮。',
    '对这个世界温柔以待，世界也会温柔以待你。','疲惫的时候，什么都不做也可以。',
    '你值得拥有一切美好的事物。','在混乱中找到自己的节奏，就好。',
    '别急，好事都在后面等你。','每一个日出，都是生活给你的一封情书。',
    '你的坚持，终有一天会开花。','抱抱自己，你很棒。',
    '辛苦了，今天也很努力呢。','不管怎样，别忘了爱自己。',
    '深呼吸，一切都会好起来的。','你不是一个人，这个世界有很多人在默默爱着你。',
    '累了就休息，天塌不下来的。','有你在的每一天，都是好天气。',
    '生活有时候会乱，但你的心可以不乱。','平凡的每一天，都是限定版的奇迹。',
    '你比你以为的更被爱着。',
  ],
  '励志':[
    '每一个不曾起舞的日子，都是对生命的辜负。','种一棵树最好的时间是十年前，其次是现在。',
    '把"我不行"改成"我试试"，世界就不一样了。','你的潜力远超你的想象。',
    '别让任何人告诉你你不行。','只有想不到，没有做不到。',
    '今天的汗水是明天的甘露。','你现在的付出，都会在未来给你回报。',
    '梦想不会主动来找你，你得自己走过去。','失败只是暂时的，放弃才是永久的。',
    '不要小看自己，你有无限可能。','全力以赴的时候，整个宇宙都会为你让路。',
    '人生没有白走的路，每一步都算数。','未来的你，会感谢现在拼命的自己。',
    '努力到无能为力，拼搏到感动自己。','你只管努力，剩下的交给时间。',
    '不逼自己一把，永远不知道自己有多优秀。','千里之行始于足下，但你得先迈出那一步。',
    '别因为没有掌声就不努力了。','成功的人不是赢在起点，而是赢在转折点。',
    '你想要的生活，得自己给自己。','当你觉得辛苦的时候，说明你在走上坡路。',
    '不是因为看到希望才努力，而是努力了才能看到希望。','做别人不愿做的事，才能过别人过不了的生活。',
    '你的每一份努力都不会被辜负。','趁年轻，多折腾。',
    '加油，你是最棒的！','光芒万丈的人，都是在背后默默努力的人。',
    '不要用别人的节奏打乱自己的步伐。','笑到最后的人，才是真正的赢家。',
    '没有白费的努力，也没有碰巧的成功。','越努力越幸运，这句话是真的。',
    '你的野心有多大，你的世界就有多大。','别怕万人阻挡，只怕自己投降。',
    '生活不会亏待每一个认真努力的人。','你正在成为你想成为的那个人。',
    '哪怕是最微小的进步，也值得庆祝。','日积月累的力量，远超你的想象。',
    '当你准备好的时候，机会就来了。','把每一天都过成值得回忆的样子。',
    '你的天花板，是别人的地板——反过来也一样。','梦想是用来实现的，不是用来想想的。',
    '不怕慢，就怕站。','你看，这世上从来就没有什么来不及。',
    '明天的你一定会感谢今天的自己。',
  ],
  '搞笑':[
    '我的人生座右铭：能躺着绝不坐着。','努力不一定成功，但不努力一定很舒服。',
    '朋友问最近过得怎样。我说：过得很好，如果不看银行余额的话。','确诊为一到周一就发作的职场PTSD。',
    '我的减肥计划：想吃就吃，毕竟心情好最重要。','每天叫醒我的不是梦想，是穷。',
    '活着活着就发现，钱还是比什么都好使。','成年人的崩溃只需要一个催活群消息。',
    '想了想我的优点：脸皮厚。','我不是懒，我只是在节约能量。',
    '"你有什么特长？""特别擅长拖延。"','上班的意义：为了更好地不上班。',
    '人生如戏，我演的是闲人甲。','减肥失败的原因：嘴比脑子快。',
    '我的精神状态如同薛定谔的猫：上班时是死的，下班后才活过来。','理想很丰满，现实很残酷，但我的肚子更丰满。',
    '人生最大的遗憾：年轻时不懂得存钱，老了不懂得花钱。','我不是社恐，我只是不想社交。',
    '每天起床第一句：为什么又是周一（或每天都像周一）。','别人的手机是娱乐工具，我的手机是生存工具。',
    '这年头连空气都在内卷，氧气含量都在降。','年龄越大越觉得，小时候的烦恼才叫奢侈。',
    '穷到连瘦都舍不得了。','不是我不努力，是社会的参考线画得太高了。',
    '今日份emo已结束，明日份emo预约中。','我的人生KPI：活着就行。',
    '存款余额是成年人的精神稳定剂。','原来发呆是我最擅长的事。',
    '活得像一棵仙人掌：耐旱、抗压、还扎人。','人活着就是在不停地和自己的惰性作斗争。',
    '工作使我快乐——是的，不工作更使我快乐。','最近的精神状态：混乱中带着一丝从容。',
    '别人的周末是诗和远方，我的周末是睡和手机。','谁说咸鱼没有梦想？翻个身也是梦想啊。',
    '你以为我在摸鱼？不，我在进行深度思考。','人生苦短，及时行乐——主要是苦短。',
    '我的社交能力如下：和外卖小哥说谢谢的时候最热情。','突然理解了为什么大人总说"等你长大就知道了"。',
    '加油？我连加醋的动力都没有了。','生活不是偶像剧，更像综艺——全是意外和笑料。',
    '能力有限，但吃饭的热情无限。','我的人生状态：间歇性踌躇满志，持续性摆烂。',
    '钱没挣到几个，倒是认清了自己。','想做有钱人的第一步：先有钱。',
    '人到中年三件套：保温杯、枸杞水、养生文。','月薪三千操着年薪百万的心。',
    '你问我梦想是什么？中彩票。',
  ],
  'emo':[
    '凌晨三点的城市，只有路灯还记得我。','白天的我嘻嘻哈哈，深夜的我独自对话。',
    '有些话，说给月亮听就好了。反正它不会回答，也不会转告。','好像突然没什么想说的了。',
    '深夜的眼泪比白天的笑容更真实。','有些人走了之后，世界好像安静了很多。',
    '假装不在意，其实比在意更累。','笑容是给别人看的，眼泪是给自己的。',
    '每个深夜难眠的人，都有一段说不出口的心事。','我不是不快乐，只是快乐太贵了。',
    '有时候不说话，不是因为没话说，而是说了也没用。','城市的灯火那么亮，却照不进我的心里。',
    '最怕深夜想起的那个人。','大人的崩溃是悄无声息的。',
    '失眠的人最懂天亮的珍贵。','有些疲惫，不是身体的，而是心的。',
    '我在人群中笑得最大声，也在深夜哭得最安静。','想找个地方安静地待一会儿。',
    '有些路注定要一个人走。','突然很想消失一段时间。',
    '不是不想说话，是找不到能说话的人。','世界很吵，而我只想安静一下。',
    '又是一个人看星星的夜晚。','开心是演出来的，难过才是真实的。',
    '深夜的朋友圈都是故事。','如果可以选择，我想做一朵云，飘到哪就在哪。',
    '所有的坚强，都是柔软生的茧。','累了，但又不能停下来。',
    '看了一百个治愈视频，还是治不好我自己。','有些人看起来很开朗，但你不知道他关了灯之后是什么样子。',
    '成年人的崩溃，只需要一个瞬间。','生活哪有什么容易的，不过是咬牙在撑。',
    '我的眼泪不值钱，但也不想随便给。','深夜的风好冷，像我的心情。',
    '其实我挺好的，只是偶尔不太开心。','有些话打了又删，删了又打。',
    '怀念没有烦恼的年纪。','大概所有的成长都是伴着疼痛的。',
    '等一个晴天，等一个拥抱。','夜深了，故事还没讲完。',
    '我把悲伤藏在笑容背后。','也许明天会好一点吧。',
    '习惯了一个人，但偶尔还是会寂寞。','有些话只能说给自己听。',
    '月亮知道我所有的秘密。','不想再假装了，真的很累。',
    '每一个失眠的夜晚，都有一个放不下的人。','心有千言万语，却不知道该对谁说。',
    '最难的不是没有人理解你，而是你不想再解释了。',
  ],
  '早安':[
    '新的一天，新的开始。阳光温暖，微风不燥，一切都在变好的路上。早安。','早安，今天也要做一个温暖的人。',
    '每一个早晨都是重新开始的机会。早安。','太阳出来了，所有的不开心都要散了。早安。',
    '你好，新的一天。请对我温柔一点。','醒来就是最大的幸运。早安，世界。',
    '早起的鸟儿有虫吃，早起的虫儿……算了不说了。早安。','一日之计在于晨，今天也要元气满满。',
    '睁开眼的第一秒就决定了今天的心情。所以，笑一个。','早安，愿你今天遇到的每个人都对你微笑。',
    '新的一天又开始了，昨天的烦恼就留在昨天吧。','阳光正好，你也正好。早安。',
    '早晨的空气特别清新，心情也跟着明亮。','今天的小目标：开心就好。早安。',
    '起床第一件事：感恩又活过了一天。','别赖床了，外面的世界在等你。早安。',
    '每一个清晨都带着希望而来。','早安，今天又是充满可能的一天。',
    '带着微笑出门，好运自然来。早安。','清晨的阳光是最好的滤镜。早安。',
    '今天的你，比昨天更好。加油，早安。','你好呀，新的一天。我准备好了。',
    '深呼吸，新的一天开始了。','早安，希望今天的咖啡特别好喝。',
    '用一杯热水开启美好的一天。早安。','早上好，今天也请多多关照。',
    '推开窗，让阳光进来。早安。','又是精神满满的一天。早安。',
    '清晨的第一缕阳光，是大自然的问候。','起床了，梦里的好事要在现实里实现。早安。',
    '每天叫醒我的是闹钟，但让我起床的是生活。','早安，给自己一个微笑先。',
    '今天也要做一个发光的人。早安。','在最美的清晨，遇见最好的自己。',
    '早起一小时，人生多一分。早安。','新的一天新的征程，冲鸭。',
    '早安，愿今天的你比昨天更快乐。','带上好心情出门，好运不会差。早安。',
    '日出东方，万物可期。早安。','每一天都值得被认真对待。早安。',
    '你的笑容是早晨最好的风景。','一切美好，从早安开始。',
    '又是元气满满的一天呀。','眨眨眼，新的一天就到了。早安。',
    '生活每天都在上新，今天又有什么惊喜呢？','早安，我的小世界。',
  ],
  '晚安':[
    '今天的烦恼就到此为止啦，明天依旧光芒万丈。晚安。','月亮出来了，该休息了。晚安。',
    '又是平安的一天，感恩。晚安。','闭上眼睛，把这一天的疲惫都卸下。晚安。',
    '夜深了，把手机放下吧。你值得一个好觉。','晚安，明天见。',
    '梦里什么都有，先睡个好觉吧。','今天辛苦了，好好休息。晚安。',
    '别熬夜了，最好的护肤品是睡眠。','星星会亮的，事情会好的。晚安。',
    '一天结束了，不管好坏，至少你努力了。晚安。','月色温柔，梦里相见。晚安。',
    '睡前想三件开心的事。晚安。','今天的任务完成了，给自己打个勾。晚安。',
    '夜晚是用来放松的，不是用来焦虑的。晚安。','枕头永远不会让你失望。晚安。',
    '黑夜给了你一双黑眼圈，但请选择闭眼。','别想太多了，先睡觉。晚安。',
    '今天的月亮特别圆（也许），晚安。','累了就睡，醒了就笑。晚安。',
    '在这个安静的夜晚，对自己说声辛苦了。','晚安，愿你的梦里有星星和棉花糖。',
    '把白天的忙碌装进夜晚的信封，明天再拆。','好好睡觉，才能好好生活。晚安。',
    '今天也平安度过了呢。晚安。','世界睡了，你也该休息了。',
    '最美的晚安是：一天的事情都处理好了。','夜色这么美，适合安然入梦。晚安。',
    '晚安的意思是：我打烊了，明天再营业。','关灯了，今天的我下班了。晚安。',
    '让所有的不开心随着夜幕散去。晚安。','枕着月光入眠，带着希望醒来。',
    '晚安。明天又是新的开始。','今天的你做得够好了，晚安。',
    '别回头看白天的事了，往前看，明天会更好。','放下手机，闭上眼，深呼吸。晚安。',
    '祝你一夜好梦，醒来神清气爽。','晚安，我把星星都留给你了。',
    '夜深了，最适合说真心话。晚安。','今晚的月亮真好看。晚安。',
    '所有的好事都发生在你睡着之后。晚安。','不管今天怎样，至少你撑过来了。晚安。',
    '愿你的夜晚温柔且安宁。','让夜风带走所有烦恼。晚安。',
    '睡觉是世界上最划算的事。晚安。','把今天画上一个圆满的句号。晚安。',
  ],
  '恋爱':[
    '遇见你之后，全世界都变成了背景板。','喜欢你是我做过最好的事。',
    '和你在一起的每一天，都是限定款的快乐。','你是我的例外，也是我的偏爱。',
    '想和你一起看日落，也想和你一起看日出。','你的名字是我听过最美的情话。',
    '在我心里你是满分，不接受反驳。','我想和你的未来签一份长期合同。',
    '从遇见你开始，我的人生就开了滤镜。','你是我的碎碎念，也是我的甜甜圈。',
    '和你在一起就是最好的时光。','我对你的喜欢，像风走了八千里，不问归期。',
    '想你的时候，连空气都是甜的。','你是我所有诗的灵感来源。',
    '有你的日子，每天都是情人节。','我的愿望清单上，都是和你有关的事。',
    '你说什么都好听，连吵架都觉得可爱。','余生请多指教。',
    '我喜欢你，认真且怂，从一而终。','你是我的星辰大海，也是我的柴米油盐。',
    '怎么办，我好像越来越喜欢你了。','见你的第一面，就输了。',
    '你是我所有的心甘情愿。','想和你去很多地方，也想和你待在家里发呆。',
    '我这辈子最大的运气，就是遇见了你。','你笑起来的样子，是我见过最好看的风景。',
    '很庆幸在对的时间遇到了对的人。','从此以后，风筝有风，海豚有海，你有我。',
    '你是我的今天，也是我的每一天。','我想和你一起变老。',
    '全世界我只想被你偏爱。','有你在身边，哪里都是家。',
    '愿你所有的浪漫都与我有关。','你是我口是心非里的认真。',
    '余光里全是你。','我的盖世英雄已经来了，TA就是你。',
    '我可以对全世界说晚安，但我最想对你说。','有你的地方，就是诗和远方。',
    '想和你一起浪费时间。','你是我平淡岁月里的星辰。',
    '谢谢你出现在我的生命里。','愿意为你做早餐，也愿意为你熬夜。',
    '如果有来生，我还是会找到你。','你永远是我掌心里的宝贝。',
    '相遇是运气，相爱是勇气。','余生很长，我想和你慢慢走。',
    '你就是我的小幸运。',
  ],
  '美食':[
    '人生苦短，甜品要趁热吃，奶茶要加冰，烧烤要加辣。','没有什么烦恼是一顿火锅解决不了的。',
    '如果有，那就两顿。','吃饱了才有力气减肥。',
    '干饭人干饭魂，干饭都是人上人。','对食物的热爱，是最朴实的浪漫。',
    '今天的卡路里，明天再说。','幸福就是饥饿时来一碗热腾腾的面。',
    '美食是打开快乐的钥匙。','人间烟火气，最抚凡人心。',
    '好吃的东西要大口吃。','减肥是不可能减肥的，这辈子都不可能。',
    '生活已经够苦了，吃点甜的吧。','火锅涮一切，烦恼煮一锅。',
    '没有一杯奶茶解决不了的心情问题。','今天的自己只想当一个合格的吃货。',
    '美食和好心情更配哦。','世界上最治愈的声音：油锅里滋滋的响。',
    '夏天必备三件套：空调、西瓜、冰淇淋。','冬天必备三件套：火锅、暖气、热奶茶。',
    '早上吃好，中午吃饱，晚上吃少——然后夜宵再补回来。','美食面前，减肥什么的都是浮云。',
    '能把饭做好的人，生活也不会差。','每一餐都值得被认真对待。',
    '吃是为了活着，但活着不仅仅是为了吃——也是为了吃更好吃的。','一碗热汤下肚，整个世界都温暖了。',
    '人活着的意义之一：今天吃什么？','最好的社交方式：一起吃饭。',
    '美食不分国界，好吃就是正义。','你的胃永远比你的脑子更诚实。',
    '一个人也要好好吃饭。','对不起，我的减肥计划被这碗面打败了。',
    '幸福有时候很简单，就是一口刚出锅的饺子。','吃到好吃的东西，眼睛会发光。',
    '世间万物皆可辜负，唯有美食不可辜负。','所有的节日都是美食节。',
    '每一种食物都有自己的故事。','今天不开心？吃块蛋糕就好了。',
    '一日三餐，四季三餐，只要有美食就有希望。','和重要的人一起吃饭，比吃什么更重要。',
    '胃满了，心就暖了。','干饭不积极，思想有问题。',
    '今天也是被美食治愈的一天。','喝一杯冰的，降降温降降火。',
    '这顿吃完我就开始减肥（每天都这么说）。',
  ],
  '职场':[
    '上班如上坟，但坟头蹦迪的是我本人。','打工人打工魂，打工都是人上人。',
    '工资是让你上班的唯一理由。','职场教会我最重要的事：微笑着说"收到"。',
    '社畜の日常：加班、外卖、地铁。','每天叫醒我的不是闹钟，是房贷。',
    '在职场里，情商比智商更重要。','今天的deadline是昨天。',
    '能用钱解决的事情就不要用感情。','又是被甲方折磨的一天。',
    '不是我爱加班，是加班爱我。','下班倒计时才是最有仪式感的事情。',
    '面试时说的话 vs 入职后干的活，完全是两个故事。','打工人的梦想：财务自由。',
    '开会一小时，有效信息五分钟。','人在工位，心在度假。',
    '最讨厌周日晚上，因为明天就是周一。','升职加薪，走上人生巅峰——先做个梦。',
    '职场最重要的技能：假装很忙。','又改需求了，甲方你还有没有心。',
    '你觉得工作难？那你试试没有工作。','公司最大的福利：准时下班。',
    '从实习生到老油条，我只用了三个月。','职场没有容易二字，只有努力和更努力。',
    '同事之间的友谊，建立在一起吐槽领导的基础上。','人到中年，上有老下有小，中间还有KPI。',
    '在公司里，最累的不是身体，是心。','你的工资配不上你的才华——但你也可能高估了自己。',
    '职场法则：少说话，多做事，不站队。','如果迟到扣钱，那加班应该加钱。',
    '今天不想上班的概率：100%。','打工人的早餐：随便对付一下。',
    '工作中最解压的事：关闭电脑。','别人是朝九晚五，我是朝九晚九。',
    '社畜的浪漫：周末不加班。','你不是不喜欢上班，你只是不喜欢受苦。',
    '能力决定了你的下限，人脉决定了你的上限。','职场就像打怪升级，但经验值给得太少了。',
    '学会拒绝是职场生存的第一课。','把情绪留在家里，把专业带到公司。',
    '别把同事当朋友——但可以把朋友变成同事。','职场生存指南：不懂就问（百度）。',
    '有些人的领导能力就体现在：让下属加班的能力。','离职的原因只有两个：钱不到位、心受委屈了。',
    '不要让工作定义你的全部价值。',
  ],
  '周末':[
    '周末的正确打开方式：睡到自然醒，吃到扶墙走。','终于等到周末了，要把一周的睡眠补回来。',
    '周末不出门是对生活最大的尊重。','周末的快乐就是什么都不做。',
    '周末是充电的日子，拒绝一切社交。','终于可以不看闹钟了。周末快乐。',
    '周末的我：葛优瘫 + 外卖 + 追剧 = 完美。','周末是用来浪费的。',
    '周末两天，一天用来休息，一天用来后悔为什么没利用好。','又到了周末选择困难症的时候。',
    '周末最大的烦恼：中午吃什么。','周末出去玩才发现，外面全是人。',
    '周末的时间过得比上班快十倍。','在家待一天的快乐，你不懂。',
    '周末就是用来补觉的，不接受反驳。','两天太短了，建议周末改成三天。',
    '周末的计划：1. 躺着  2. 继续躺着  3. 换个姿势躺着。','享受一个人的周末时光。',
    '周末快乐的关键：不想工作的事。','最幸福的事是周五晚上想到明天不用上班。',
    '周末的意义：证明自己不工作也能活。','一到周末就变成了夜猫子。',
    '周末约吗？不约，我和床约好了。','周末出行建议：沙发上的世界之旅。',
    '周末和朋友聚餐，是一周最好的奖励。','理想的周末：什么都不做但什么都做了。',
    '周末的仪式感：一杯咖啡一本书。','终于可以穿着睡衣待一整天了。',
    '周末的幸福感爆棚。','周末的早晨慢悠悠的，真好。',
    '两天周末不够用——这是全球共识。','周末的第一件事：关掉工作群的通知。',
    '快乐是周末带来的，悲伤是周日晚上制造的。','和喜欢的人一起度过周末，是双倍快乐。',
    '宅在家也是一种旅行——精神上的。','周末的意义就在于让你知道：你还有生活。',
    '享受当下的每一分每一秒。周末快乐。','这个周末属于我自己。',
    '周末的空气都比工作日的甜。','最好的假期就是不用做任何决定的周末。',
    '周末最让人满足的事：一觉睡到自然醒。','又是一个值得记录的周末。',
    '周末适合做一切让你开心的事。',
  ],
  '健身':[
    '今天的汗水，是明天的勋章。跑起来，世界都不一样了。','自律给我自由，运动给我力量。',
    '身体是灵魂的容器，好好照顾它。','出发前你想放弃，跑完后你感谢自己。',
    '运动是最好的情绪调节器。','你的身体记得每一次训练。',
    '没有一滴汗水是白流的。','运动的时候，什么烦恼都会消失。',
    '能跑多远跑多远，能跑多快跑多快。','每一次突破极限都是在重新定义自己。',
    '健身不是为了别人，是为了自己。','汗水不会骗人，镜子不会说谎。',
    '坚持运动30天，你会爱上这种感觉。','跑步教会我的道理：一步一步来。',
    '运动后的那杯水，是世界上最好喝的水。','今天不想运动——所以才要去运动。',
    '把每一次训练当成一次进化。','运动的人都在发光。',
    '健身房是最好的情绪出口。','一个人跑步的时候，脑子特别清醒。',
    '肌肉不会辜负你的汗水。','运动是给自己最好的礼物。',
    '坚持了才知道，运动真的会上瘾。','夏天到了，是时候让腹肌见见阳光了。',
    '跑步的人，眼里有星光。','用运动开始新的一天。',
    '七分练三分吃，自律才是关键。','今天的打卡：完成。',
    '别人在睡觉，我在出汗。差距就是这么拉开的。','运动让我更自信。',
  ],
  '游戏':[
    '今晚开黑吗？三缺一。','别问我最近在干什么，问就是在肝。',
    '游戏里的我vs现实中的我，判若两人。','人生如游戏，但不能存档读档。',
    '又双叒叕输了……再来一局。','赢了会所嫩模，输了下海干活。',
    '打游戏的快乐，你不打不知道。','队友太菜了——嗯，就是我自己。',
    '游戏是成年人的童话。','今天的MVP是我，不接受反驳。',
    '周末最幸福的事：打一整天游戏不被打扰。','老婆做错了什么，要陪我打游戏。',
    '放下工作，拿起手柄，这一刻只属于我。','游戏教会我的道理：配合很重要。',
    '人可以不上班，但不能不打游戏。','充了多少钱不重要，开心最重要（自我安慰）。',
    '今晚的电竞梦又碎了。','技术不行，装备来凑。',
    '深夜打游戏的快乐，胜过一切。','一盘游戏的时间刚好——等等，怎么天亮了。',
    '人生第一个成就：游戏通关。','你是我的队友也是我的对手，说的就是你。',
    '游戏可以输，心态不能崩。','下一局一定赢——flag立好了。',
    '打游戏是最便宜的快乐。','没有什么事情是一局游戏解决不了的。',
  ],
  'MBTI':[
    '确诊为INFP：每天活在自己的小世界里。','INTJ：我不是冷漠，我只是在思考如何优化全人类。',
    'ENFP：今天的我又有了一百个新想法！','ISTJ：按计划来，不要给我意外。',
    'INTP：这个问题很有意思，让我想三天。','ENFJ：你开心吗？你不开心我来帮你开心。',
    'ISTP：话不多，但手比较巧。','ESFP：人生就是一场派对，我来了！',
    'ENTJ：这件事应该这么做——听我的就对了。','ISFJ：我不说，但我都记在心里了。',
    'ESTP：想到就做，明天？明天再说。','INFJ：我理解你说的，和你没说的。',
    'ENTP：辩论使我快乐，尤其是我赢的时候。','ISFP：美好的事物值得慢慢欣赏。',
    'ESTJ：规则是用来遵守的，谁也别想搞特殊。','ESFJ：你吃了吗？穿暖了吗？开心吗？',
    'I人社交：消耗能量  E人社交：充电模式','INFP的日常：一边emo一边幻想。',
    'INTJ看世界：这个可以优化，那个也可以优化。','ENFP的脑子：同时开了一百个浏览器标签。',
    'ISTJ的安全感来自于一切按部就班。','INTP分析事物的方式让普通人望而却步。',
    'ENFJ：天生的温暖制造机。','ISTP：安静的实干家。',
    'ESFP的人生信条：开心最重要。','ENTJ的日程表：精确到分钟。',
    'ISFJ默默为所有人操心着。','ESTP永远在冒险的路上。',
    'INFJ的直觉准得离谱。','ENTP和谁都能聊，但不一定和谁都聊得深。',
    'ISFP眼中的世界比别人多一层色彩。','ESTJ：效率是第一生产力。',
    'ESFJ是朋友圈里最暖心的存在。','I人：今天的社交额度用完了。',
    'E人：再来十个聚会我都行。','MBTI只是参考，你不会被四个字母定义。',
    'INFP和INTJ是最奇妙的组合。','ENFP + INTJ = 互补的灵魂。',
    'I人在家充电，E人出门充电。','你以为的内向，只是没遇到对的人。',
    'MBTI测试结果：确诊为人类。','每个人格类型都有自己的超能力。',
    'INFP在艺术中找到灵魂的归宿。','ENTJ的人生是一盘精心布局的棋。',
    'ISFJ的爱是润物细无声的。','ENTP的世界没有无聊二字。',
    '对INTP来说，思考本身就是快乐。','ESFP是人群中最亮的那颗星。',
    '每种性格都是独特的礼物。','别拿MBTI给自己贴限制性标签。',
    '了解自己的MBTI不是为了分类，而是为了更好地认识自己。',
  ],
  '颜文字':[
    '(◕‿◕✿) 今天也要元气满满哦','꒰ᐢ⸝⸝•༝•⸝⸝ᐢ꒱ 偷偷看你一眼',
    '( •̀ᴗ•́ )و✧ 加油打工人','(╥﹏╥) 好难过……',
    '(ง •̀_•́)ง 冲鸭！','( ˶ˆᗜˆ˵ ) 嘿嘿嘿',
    '(｡•́︿•̀｡) 我不是故意的……','(灬º‿º灬)♡ 喜欢你',
    '( ´͈ ᐜ `͈ )◞♡ 心动了','(✿◠‿◠) 美好的一天',
    '(☞ﾟ∀ﾟ)☞ 就是你','( •̥́ ̫ •̥̀ ) 委屈巴巴',
    '♪(´ε` ) lalala～','(¬‿¬ ) 嘿嘿嘿',
    '( ⸝⸝•ᴗ•⸝⸝ )੭⁾⁾ 蹦蹦跳跳','╰(*°▽°*)╯ 太开心了',
    '(´;ω;`) 呜呜呜','(ᗒᗩᗕ) 我裂开了',
    '(o゜▽゜)o☆ 太棒了！','( ˃̣̣̥᷄⌓˂̣̣̥᷅ ) 泪目',
    '( ✧Д✧) 我的天！','( ˘ω˘ ) 困了困了',
    'ʕ•ᴥ•ʔ 你好呀','٩(ˊᗜˋ*)و♡ 嘻嘻',
    '(◍•ᴗ•◍) 开心！','( ⁰▿⁰ ) 微笑面对一切',
    '(´∀`)♡ 满满的爱','(๑•̀ㅁ•́๑)✧ 准备出发',
    '(っ˘ω˘ς ) 好困啊','꒰˘̩̩̩⌣˘̩̩̩๑꒱♡ 好想你',
    '( ᐛ )و 搞定！','(∩^o^)⊃━☆ 施魔法中',
    '(*ˊᗜˋ*)/ᵗᑋᵃᐢᵏ ᵞᵒᵘ* 谢谢你','ᕕ( ᐛ )ᕗ 跑起来',
    '(◕ᴗ◕✿) 岁月静好','( ´_ゝ`) 淡定.jpg',
    '(σ≧▽≦)σ 赢了！','( ˊ̱˂˃ˋ̱ ) 不开心',
  ],
};
const CLONE_FALLBACK = ['类似的感觉，不同的表达——每一句都值得被收藏。','换个角度看同样的风景，依然很美。','同频共振的文字，总能击中柔软的部分。','文字的力量在于：你以为只是自己的心情，其实全世界都懂。'];

function generateClones(item) {
  const theme=item.theme||'';
  const allC=[...ALL_POPULAR_COPIES_HOT,...ALL_POPULAR_COPIES_NORMAL];
  const sameT=allC.filter(c=>c.text!==item.text&&(c.theme===theme||(c.tags&&item.tags&&item.tags.some(t=>c.tags.includes(t))))).sort(()=>Math.random()-.5).slice(0,2).map(c=>c.text);
  const tmpl=(CLONE_TEMPLATES[theme]||[]).filter(t=>t!==item.text).sort(()=>Math.random()-.5);
  const all=[...new Set([...sameT,...tmpl])].filter(t=>t!==item.text);
  if(all.length<2) all.push(...CLONE_FALLBACK.sort(()=>Math.random()-.5).slice(0,3-all.length));
  return all.slice(0,3);
}

// ========== 每小时刷新 ==========
let lastRefreshHour = new Date().getHours();
function checkHourlyRefresh(){
  const ch=new Date().getHours();
  if(ch!==lastRefreshHour){
    lastRefreshHour=ch;
    const ns=(()=>{const n=new Date();return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')} ${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}`;})();
    const all=[...ALL_POPULAR_COPIES_HOT,...ALL_POPULAR_COPIES_NORMAL];
    all.sort(()=>Math.random()-.5).slice(0,4).forEach(c=>{c.updatedAt=ns;c._isNew=true;});
    if(document.getElementById('recSection').style.display!=='none'){
      const r=buildShuffledCopies();ALL_POPULAR_COPIES.length=0;r.forEach(c=>ALL_POPULAR_COPIES.push(c));
      popPage=0;renderPopularCopies();updateRefreshTime();toast('🔥 发现新内容，已自动更新！');
    }
  }
}
setInterval(checkHourlyRefresh,30000);

function updateRefreshTime(){
  const el=document.getElementById('refreshTime');if(!el)return;
  const n=new Date();
  el.textContent=`最近更新 ${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')} · 每小时自动刷新`;
}

// ========== 渲染推荐 ==========
function renderRecommend(){
  const srcB=s=>s==='xhs'?'<span class="source-badge source-xhs">小红书</span>':s==='weibo'?'<span class="source-badge source-weibo">微博</span>':s==='douyin'?'<span class="source-badge source-douyin">抖音</span>':s==='ted'?'<span class="source-badge source-ted">TED</span>':'';
  // 按时间适配度排序热门话题：适合当前时段的排前面
  const sortedTopics = [...HOT_TOPICS].sort((a,b) => timeScore(b.timeFit) - timeScore(a.timeFit));
  document.getElementById('hotTopics').innerHTML=sortedTopics.map((t,i)=>{
    const origIdx = HOT_TOPICS.indexOf(t);
    return `<div class="hot-item" onclick="openTopic(${origIdx})"><div class="hot-rank r${i+1}">${i+1}</div><div class="hot-title">${t.title} ${srcB(t.src)}</div><div class="hot-heat">${t.heat}</div></div>`;
  }).join('');
  // 按时间适配度排序分类推荐
  const sortedCats = [...REC_CATEGORIES].sort((a,b) => timeScore(b.timeFit) - timeScore(a.timeFit));
  document.getElementById('recCats').innerHTML=sortedCats.map((c,i)=>{
    const origIdx = REC_CATEGORIES.indexOf(c);
    return `<div class="rec-cat" onclick="openCategory(${origIdx})"><span class="cat-icon">${c.icon}</span>${c.label}</div>`;
  }).join('');
  renderPopularCopies();
  updateRefreshTime();
}

// ========== 语录筛选 ==========
const FILTER_PAGE_SIZE=10;
let filterItems=[],filterPage=0;

function matchCopies(mTags,mThemes,mText){
  const all=[...ALL_POPULAR_COPIES_HOT,...ALL_POPULAR_COPIES_NORMAL];
  const seen=new Set(),results=[];
  for(const c of all){
    const k=c.text.slice(0,50);if(seen.has(k))continue;
    let match=false;
    if(mTags&&mTags.length&&c.tags){for(const mt of mTags){if(c.tags.some(t=>t.toLowerCase().includes(mt.toLowerCase().replace('#','')))){match=true;break;}}}
    if(!match&&mThemes&&mThemes.length&&c.theme){if(mThemes.includes(c.theme))match=true;}
    if(!match&&mText&&mText.length){for(const kw of mText){if(c.text.includes(kw)){match=true;break;}}}
    if(match){seen.add(k);results.push(c);}
  }
  return results;
}

function openTopic(i){const t=HOT_TOPICS[i];showFilter(`🔥 ${t.title}`,`${t.heat} · 共 `,matchCopies(t.matchTags,t.matchThemes,t.matchText));}
function openCategory(i){const c=REC_CATEGORIES[i];showFilter(`${c.icon} ${c.label}`,`共 `,matchCopies(c.matchTags,c.matchThemes,[]));}

function showFilter(title,metaP,items){
  filterItems=items.sort(()=>Math.random()-.5);filterPage=0;
  document.getElementById('filterTitle').textContent=title;
  document.getElementById('filterMeta').textContent=metaP+items.length+' 条语录';
  document.getElementById('recSection').style.display='none';
  document.getElementById('filterSection').style.display='';
  renderFilterPage();
  document.getElementById('main').scrollTo({top:0,behavior:'smooth'});
}

function renderFilterPage(){
  const start=filterPage*FILTER_PAGE_SIZE,items=filterItems.slice(start,start+FILTER_PAGE_SIZE);
  document.getElementById('filterList').innerHTML=items.map((p,idx)=>{
    const uid=`f-${filterPage}-${idx}`,tagsH=(p.tags||[]).map((t,ti)=>ti<2?`<span class="pop-tag">${t}</span>`:`<span class="pop-tag pop-tag-ai">${t}</span>`).join('');
    const fr=formatFreshness(p.updatedAt);
    return `<div class="pop-item${p.hot?' pop-hot':''}">
      ${p.hot?'<span class="hot-badge">hot</span>':''}
      <div class="pop-tags">${tagsH}</div><div class="pop-text">${p.text}</div>
      <div class="pop-foot"><span class="pop-meta">${p.hot?'🔥 ':''}${p.meta}${fr?' · '+fr:''}</span>
      <div class="pop-actions"><button class="pop-btn pop-copy" onclick="event.stopPropagation();cpPop(this,\`${p.text.replace(/`/g,"\\`")}\`)">复制</button>
      <button class="pop-btn pop-clone-btn" onclick="event.stopPropagation();cloneF(${filterPage},${idx},this)">克隆生成</button></div></div>
      <div class="clone-area" id="ca-${uid}" style="display:none"></div></div>`;
  }).join('');
  const tp=Math.max(1,Math.ceil(filterItems.length/FILTER_PAGE_SIZE));
  document.getElementById('filterPager').innerHTML=Array.from({length:tp},(_,i)=>`<span class="pg-dot${i===filterPage?' active':''}" onclick="goFP(${i})"></span>`).join('')+`<span class="pg-info">${filterPage+1}/${tp}</span>`;
}

function cloneF(pg,idx,btn){
  const item=filterItems[pg*FILTER_PAGE_SIZE+idx],area=document.getElementById(`ca-f-${pg}-${idx}`);
  if(!area){return;}
  if(area.style.display!=='none'){area.style.display='none';btn.textContent='克隆生成';btn.classList.remove('pop-clone-active');return;}
  btn.textContent='生成中...';btn.disabled=true;
  setTimeout(()=>{
    const cl=generateClones(item);
    area.innerHTML=cl.map((t,i)=>`<div class="clone-item" style="animation-delay:${i*0.1}s"><div class="clone-label">同款 ${i+1}</div><div class="clone-text">${t}</div><button class="pop-btn pop-copy clone-copy-btn" onclick="event.stopPropagation();cpPop(this,\`${t.replace(/`/g,"\\`")}\`)">复制</button></div>`).join('');
    area.style.display='';btn.textContent='收起';btn.disabled=false;btn.classList.add('pop-clone-active');
  },600);
}

function goFP(p){filterPage=p;const l=document.getElementById('filterList');l.style.opacity='0';setTimeout(()=>{renderFilterPage();l.style.opacity='1';},200);}
function closeFilter(){document.getElementById('filterSection').style.display='none';document.getElementById('recSection').style.display='';document.getElementById('main').scrollTo({top:0,behavior:'smooth'});}

// ========== 热门文案渲染 ==========
function renderPopularCopies(){
  const start=(popPage*POP_PAGE_SIZE)%ALL_POPULAR_COPIES.length;
  const items=[];for(let i=0;i<POP_PAGE_SIZE;i++)items.push(ALL_POPULAR_COPIES[(start+i)%ALL_POPULAR_COPIES.length]);
  document.getElementById('popList').innerHTML=items.map((p,idx)=>{
    const gi=(start+idx)%ALL_POPULAR_COPIES.length;
    const tagsH=(p.tags||[]).map((t,ti)=>ti<2?`<span class="pop-tag">${t}</span>`:`<span class="pop-tag pop-tag-ai">${t}</span>`).join('');
    const fr=formatFreshness(p.updatedAt),isN=p._isNew;
    return `<div class="pop-item${p.hot?' pop-hot':''}" id="pc-${gi}">
      ${p.hot?'<span class="hot-badge">hot</span>':''}
      <div class="pop-tags">${tagsH}</div><div class="pop-text">${p.text}</div>
      <div class="pop-foot"><span class="pop-meta">${p.hot?'🔥 ':''}${p.meta}${fr?' · '+fr:''}</span>
      <div class="pop-actions"><button class="pop-btn pop-copy" onclick="event.stopPropagation();cpPop(this,\`${p.text.replace(/`/g,"\\`")}\`)">复制</button>
      <button class="pop-btn pop-clone-btn" onclick="event.stopPropagation();cloneG(${gi},this)">克隆生成</button></div></div>
      <div class="clone-area" id="ca-${gi}" style="display:none"></div></div>`;
  }).join('');
  const tp=Math.ceil(ALL_POPULAR_COPIES.length/POP_PAGE_SIZE),cp=popPage%tp;
  document.getElementById('popPager').innerHTML=Array.from({length:tp},(_,i)=>`<span class="pg-dot${i===cp?' active':''}" onclick="goPP(${i})"></span>`).join('')+`<span class="pg-info">${cp+1}/${tp}</span>`;
}

function cloneG(gi,btn){
  const item=ALL_POPULAR_COPIES[gi],area=document.getElementById(`ca-${gi}`);
  if(area.style.display!=='none'){area.style.display='none';btn.textContent='克隆生成';btn.classList.remove('pop-clone-active');return;}
  btn.textContent='生成中...';btn.disabled=true;
  setTimeout(()=>{
    const cl=generateClones(item);
    area.innerHTML=cl.map((t,i)=>`<div class="clone-item" style="animation-delay:${i*0.1}s"><div class="clone-label">同款 ${i+1}</div><div class="clone-text">${t}</div><button class="pop-btn pop-copy clone-copy-btn" onclick="event.stopPropagation();cpPop(this,\`${t.replace(/`/g,"\\`")}\`)">复制</button></div>`).join('');
    area.style.display='';btn.textContent='收起';btn.disabled=false;btn.classList.add('pop-clone-active');
  },600);
}

function cpPop(btn,text){
  navigator.clipboard.writeText(text).then(()=>{
    btn.textContent='已复制';btn.classList.add('copied');toast('复制成功！');
    setTimeout(()=>{btn.textContent='复制';btn.classList.remove('copied');},2000);
  });
}

function refreshPopular(){popPage++;popPage%=Math.ceil(ALL_POPULAR_COPIES.length/POP_PAGE_SIZE);const l=document.getElementById('popList');l.style.opacity='0';l.style.transform='translateY(8px)';setTimeout(()=>{renderPopularCopies();l.style.opacity='1';l.style.transform='translateY(0)';},200);}
function goPP(p){popPage=p;const l=document.getElementById('popList');l.style.opacity='0';setTimeout(()=>{renderPopularCopies();l.style.opacity='1';l.style.transform='translateY(0)';},200);}

// ========== 事件绑定 & 初始化 ==========
document.getElementById('userInput').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();generate();}});
renderRecommend();
