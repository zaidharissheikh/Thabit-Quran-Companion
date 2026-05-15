export const VERSES = [
  {
    ar: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    en: '"So remember Me; I will remember you. And be grateful to Me and do not deny Me."',
    ref: 'Al-Baqarah 2:152',
    surah: 'Al-Baqarah',
  },
  {
    ar: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    en: '"Allah does not burden a soul beyond that it can bear."',
    ref: 'Al-Baqarah 2:286',
    surah: 'Al-Baqarah',
  },
  {
    ar: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    en: '"Indeed, with hardship will be ease."',
    ref: 'Ash-Sharh 94:6',
    surah: 'Ash-Sharh',
  },
  {
    ar: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
    en: '"And whoever fears Allah - He will make for him a way out."',
    ref: 'At-Talaq 65:2',
    surah: 'At-Talaq',
  },
  {
    ar: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
    en: '"And He is with you wherever you are."',
    ref: 'Al-Hadid 57:4',
    surah: 'Al-Hadid',
  },
  {
    ar: 'رَبِّ اشْرَحْ لِي صَدْرِي',
    en: '"My Lord, expand for me my breast with assurance."',
    ref: 'Ta-Ha 20:25',
    surah: 'Ta-Ha',
  },
  {
    ar: 'وَعَسَىٰ أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ',
    en: '"But perhaps you hate a thing and it is good for you."',
    ref: 'Al-Baqarah 2:216',
    surah: 'Al-Baqarah',
  },
]

export const FATIHA = [
  { num: 1, ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
  { num: 2, ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', en: '[All] praise is [due] to Allah, Lord of the worlds.' },
  { num: 3, ar: 'الرَّحْمَٰنِ الرَّحِيمِ', en: 'The Entirely Merciful, the Especially Merciful.' },
  { num: 4, ar: 'مَالِكِ يَوْمِ الدِّينِ', en: 'Sovereign of the Day of Recompense.' },
  { num: 5, ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', en: 'It is You we worship and You we ask for help.' },
  { num: 6, ar: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', en: 'Guide us to the straight path.' },
  {
    num: 7,
    ar: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّآلِّينَ',
    en: 'The path of those upon whom You have bestowed favor, not those who have evoked anger or gone astray.',
  },
]

export const HEART_OPTIONS = [
  { value: 1, emoji: '🌑', label: 'Heavy' },
  { value: 2, emoji: '☁️', label: 'Cloudy' },
  { value: 3, emoji: '🌱', label: 'Blooming' },
  { value: 4, emoji: '✨', label: 'Aligned' },
  { value: 5, emoji: '🕊️', label: 'Peaceful' },
]

export const EMPTY_JOURNAL_MARKUP = {
  icon: 'auto_stories',
  title: 'No reflections yet.',
  subtitle: 'Post one from Momentum.',
}

export const SURAHS = [
  { num: 1, name: 'Al-Fatihah', ar: 'الفاتحة', meaning: 'The Opening', verses: 7, type: 'Makki' },
  { num: 2, name: 'Al-Baqarah', ar: 'البقرة', meaning: 'The Cow', verses: 286, type: 'Madni' },
  { num: 36, name: 'Ya-Sin', ar: 'يس', meaning: 'Ya Sin', verses: 83, type: 'Makki' },
  { num: 67, name: 'Al-Mulk', ar: 'الملك', meaning: 'The Sovereignty', verses: 30, type: 'Makki' },
  { num: 18, name: 'Al-Kahf', ar: 'الكهف', meaning: 'The Cave', verses: 110, type: 'Makki' },
  { num: 55, name: 'Ar-Rahman', ar: 'الرحمن', meaning: 'The Beneficent', verses: 78, type: 'Madni' },
]
