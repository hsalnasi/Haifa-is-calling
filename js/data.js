/* ==========================================================
   data.js — EVERYTHING Haifa says lives here.
   Edit this file to change questions or answers, then refresh the page.

   Each question has:
     id   → short name; the voice recording must be audio/<id>.mp3
     q    → the question in English (shown on the button)
     qzh  → the question in Chinese
     qpy  → the question in pinyin
     a    → the answer: a list of sentences. Each sentence is a list of "tokens":
              ["学习", "xué-xí"]  characters + pinyin.
                                  Use "-" between syllables of ONE word (one syllable per
                                  character) and a space between separate words.
              ["。"]              punctuation (no pinyin)
              ["Fazaa"]           English/Latin text (no pinyin)
     en   → the English translation, one string per sentence

   The order here = the order of the question buttons.
   ========================================================== */

const DATA = [
  {
    id: "name",          // also the audio file name: audio/name.mp3
    q:   "What's your name?",
    qzh: "你叫什么名字？",
    qpy: "Nǐ jiào shénme míngzi?",
    a: [
      [["你好", "nǐ hǎo"], ["！"], ["我", "wǒ"], ["叫", "jiào"], ["海法", "Hǎi-fǎ"], ["。"]]
    ],
    en: [
      "Hello! My name is Haifa."
    ]
  },
  {
    id: "age",          // also the audio file name: audio/age.mp3
    q:   "How old are you?",
    qzh: "你多大？",
    qpy: "Nǐ duō dà?",
    a: [
      [["我", "wǒ"], ["二十一", "èr-shí-yī"], ["岁", "suì"], ["。"]]
    ],
    en: [
      "I am 21 years old."
    ]
  },
  {
    id: "student",          // also the audio file name: audio/student.mp3
    q:   "Are you a university student?",
    qzh: "你是大学生吗？",
    qpy: "Nǐ shì dàxuéshēng ma?",
    a: [
      [["是", "shì"], ["，"], ["我", "wǒ"], ["是", "shì"], ["大学生", "dà-xué-shēng"], ["。"]],
      [["我", "wǒ"], ["学习", "xué-xí"], ["计算机", "jì-suàn-jī"], ["科学", "kē-xué"], ["。"]]
    ],
    en: [
      "Yes, I am a university student.",
      "I study computer science."
    ]
  },
  {
    id: "university",          // also the audio file name: audio/university.mp3
    q:   "Where do you study?",
    qzh: "你在哪儿学习？",
    qpy: "Nǐ zài nǎr xuéxí?",
    a: [
      [["我", "wǒ"], ["在", "zài"], ["Dar Al-Hekma"], ["大学", "dà-xué"], ["学习", "xué-xí"], ["。"]]
    ],
    en: [
      "I study at Dar Al-Hekma University."
    ]
  },
  {
    id: "family",          // also the audio file name: audio/family.mp3
    q:   "How many people are in your family?",
    qzh: "你家有几个人？",
    qpy: "Nǐ jiā yǒu jǐ ge rén?",
    a: [
      [["我", "wǒ"], ["家", "jiā"], ["有", "yǒu"], ["九", "jiǔ"], ["个", "ge"], ["人", "rén"], ["："], ["爸爸", "bà-ba"], ["、"], ["妈妈", "mā-ma"], ["、"], ["三", "sān"], ["个", "ge"], ["哥哥", "gē-ge"], ["、"], ["两", "liǎng"], ["个", "ge"], ["姐姐", "jiě-jie"], ["、"], ["一", "yí"], ["个", "ge"], ["弟弟", "dì-di"], ["和", "hé"], ["我", "wǒ"], ["。"]],
      [["我", "wǒ"], ["有", "yǒu"], ["六", "liù"], ["个", "ge"], ["兄弟", "xiōng-dì"], ["姐妹", "jiě-mèi"], ["。"]]
    ],
    en: [
      "There are nine people in my family: my dad, my mom, three older brothers, two older sisters, one younger brother, and me.",
      "I have six siblings."
    ]
  },
  {
    id: "work",          // also the audio file name: audio/work.mp3
    q:   "What are you doing these days?",
    qzh: "你最近在做什么？",
    qpy: "Nǐ zuìjìn zài zuò shénme?",
    a: [
      [["我", "wǒ"], ["在", "zài"], ["学习", "xué-xí"], ["人工", "rén-gōng"], ["智能", "zhì-néng"], ["和", "hé"], ["机器", "jī-qì"], ["学习", "xué-xí"], ["。"]]
    ],
    en: [
      "I am learning AI and machine learning."
    ]
  },
  {
    id: "hobby",          // also the audio file name: audio/hobby.mp3
    q:   "What do you like?",
    qzh: "你喜欢什么？",
    qpy: "Nǐ xǐhuan shénme?",
    a: [
      [["我", "wǒ"], ["喜欢", "xǐ-huan"], ["写", "xiě"], ["代码", "dài-mǎ"], ["。"]],
      [["我", "wǒ"], ["在", "zài"], ["做", "zuò"], ["一个", "yí ge"], ["学生", "xué-sheng"], ["互相", "hù-xiāng"], ["帮助", "bāng-zhù"], ["的", "de"], ["学习", "xué-xí"], ["平台", "píng-tái"], ["，"], ["它", "tā"], ["叫", "jiào"], ["Fazaa"], ["。"]]
    ],
    en: [
      "I like writing code.",
      "I am building a learning platform where students help each other. It is called Fazaa."
    ]
  },
  {
    id: "chinese",          // also the audio file name: audio/chinese.mp3
    q:   "Do you like Chinese?",
    qzh: "你喜欢中文吗？",
    qpy: "Nǐ xǐhuan Zhōngwén ma?",
    a: [
      [["喜欢", "xǐ-huan"], ["！"]],
      [["中文", "Zhōng-wén"], ["很", "hěn"], ["有意思", "yǒu yì-si"], ["。"]]
    ],
    en: [
      "Yes, I do!",
      "Chinese is very interesting."
    ]
  },
  {
    id: "bye",          // also the audio file name: audio/bye.mp3
    q:   "Thank you, goodbye!",
    qzh: "谢谢，再见！",
    qpy: "Xièxie, zàijiàn!",
    a: [
      [["不客气", "bú kè-qi"], ["！"]],
      [["再见", "zài-jiàn"], ["！"]]
    ],
    en: [
      "You're welcome!",
      "Goodbye!"
    ]
  }
];
