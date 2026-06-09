import type { EducationalValue } from "@/types";

export interface ValueDefinition {
  id: EducationalValue;
  uzbekLabel: string;
  englishLabel: string;
  emoji: string;
  description: string;
  storyElements: string[];
  uzbekKeywords: string[];
}

export const EDUCATIONAL_VALUES: ValueDefinition[] = [
  {
    id: "ezgulik",
    uzbekLabel: "Ezgulik",
    englishLabel: "Kindness",
    emoji: "🤝",
    description: "Boshqalarga yaxshilik qilish, mehribon bo'lish",
    storyElements: [
      "hero helps a stranger in need",
      "acts of generosity rewarded",
      "compassion shown to animals or elderly",
    ],
    uzbekKeywords: ["yaxshilik", "mehribon", "saxiy", "yordam"],
  },
  {
    id: "halollik",
    uzbekLabel: "Halollik",
    englishLabel: "Honesty",
    emoji: "✨",
    description: "To'g'rilik, rostgo'ylik, halol bo'lish",
    storyElements: [
      "hero tells the truth even when difficult",
      "dishonesty leads to problems",
      "honesty brings trust and reward",
    ],
    uzbekKeywords: ["rostgo'y", "halol", "to'g'ri", "ishonch"],
  },
  {
    id: "odob-axloq",
    uzbekLabel: "Odob-axloq",
    englishLabel: "Good Manners",
    emoji: "🌸",
    description: "Muomala madaniyati, odobli bo'lish",
    storyElements: [
      "polite greeting and respect shown",
      "table manners and social etiquette",
      "respectful speech to elders",
    ],
    uzbekKeywords: ["odob", "hurmat", "salom", "rahmat", "iltimos"],
  },
  {
    id: "ilm-marifat",
    uzbekLabel: "Ilm-ma'rifat",
    englishLabel: "Knowledge",
    emoji: "📚",
    description: "Bilim olish, o'rganish, ilmli bo'lish",
    storyElements: [
      "studying leads to success",
      "curiosity and questioning rewarded",
      "knowledge solves problems cleverness wins",
    ],
    uzbekKeywords: ["bilim", "ilm", "o'qish", "maktab", "aqlli"],
  },
  {
    id: "kitobxonlik",
    uzbekLabel: "Kitobxonlik",
    englishLabel: "Love of Reading",
    emoji: "📖",
    description: "Kitob o'qishni sevish, bilimga intilish",
    storyElements: [
      "reading saves the day",
      "library or books featured prominently",
      "hero loves reading and it helps them",
    ],
    uzbekKeywords: ["kitob", "o'qish", "kutubxona", "sahifa"],
  },
  {
    id: "vatanparvarlik",
    uzbekLabel: "Vatanparvarlik",
    englishLabel: "Patriotism",
    emoji: "🇺🇿",
    description: "Vatanni sevish, milliy qadriyatlarni hurmat qilish",
    storyElements: [
      "pride in Uzbek culture and traditions",
      "protecting nature and homeland",
      "celebrating national festivals and heritage",
    ],
    uzbekKeywords: ["vatan", "o'zbek", "milliy", "an'ana", "tarix"],
  },
  {
    id: "ota-ona-hurmat",
    uzbekLabel: "Ota-onaga hurmat",
    englishLabel: "Respect for Parents",
    emoji: "👨‍👩‍👧",
    description: "Ota-onani hurmat qilish va ularning maslahatiga quloq solish",
    storyElements: [
      "hero listens to parents' advice",
      "helping parents at home",
      "parents' wisdom proves right",
    ],
    uzbekKeywords: ["ota", "ona", "oila", "hurmat", "nasihat"],
  },
  {
    id: "ustoz-ehtirom",
    uzbekLabel: "Ustozga ehtirom",
    englishLabel: "Respect for Teachers",
    emoji: "🏫",
    description: "O'qituvchini hurmat qilish va ta'limga e'tibor berish",
    storyElements: [
      "teacher guides hero to success",
      "respecting and thanking teacher",
      "knowledge from teacher saves the day",
    ],
    uzbekKeywords: ["ustoz", "o'qituvchi", "maktab", "saboq", "dars"],
  },
  {
    id: "dostlik",
    uzbekLabel: "Do'stlik",
    englishLabel: "Friendship",
    emoji: "🤗",
    description: "Chin do'stlik, birlik va hamkorlik",
    storyElements: [
      "friends help each other through difficulty",
      "loneliness overcome through friendship",
      "teamwork solves the problem",
    ],
    uzbekKeywords: ["do'st", "birlik", "hamkor", "yordam", "birgalik"],
  },
  {
    id: "mehnatsevarlik",
    uzbekLabel: "Mehnatsevarlik",
    englishLabel: "Hard Work",
    emoji: "💪",
    description: "Mehnat qilish, tirishqoqlik, sabr-toqat",
    storyElements: [
      "hard work and perseverance lead to success",
      "lazy character learns lesson",
      "persistence overcomes obstacles",
    ],
    uzbekKeywords: ["mehnat", "tirishqoq", "sabr", "g'ayrat", "harakat"],
  },
];

export const VALUE_MAP = EDUCATIONAL_VALUES.reduce(
  (acc, v) => {
    acc[v.id] = v;
    return acc;
  },
  {} as Record<EducationalValue, ValueDefinition>
);
