/**
 * Girl sticker pack (default)
 */
export const GIRL_STICKERS = {
  happy: '/assets/happy.png',
  angry: '/assets/angry.png',
  sad: '/assets/sad.png',
  horrified: '/assets/horrified.png',
  spiritual: '/assets/spiritual.png',
}

/**
 * Boy sticker pack
 */
export const BOY_STICKERS = {
  happy: '/assets/boy_happy.png',
  angry: '/assets/boy_angry.png',
  sad: '/assets/boy_sad.png',
  horrified: '/assets/boy_horrified.png',
  // cache-bust after regenerating Tranquil (distinct from Radiant)
  spiritual: '/assets/boy_spiritual.png?v=2',
}

/**
 * Resolve sticker set based on stickerPack preference ('girl' | 'boy')
 * Defaults to 'girl' or saved localStorage setting 'thabit_sticker_pack'
 */
export function getMoodStickers(pack) {
  const selected = pack || localStorage.getItem('thabit_sticker_pack') || 'girl'
  return selected === 'boy' ? BOY_STICKERS : GIRL_STICKERS
}

export const MOOD_STICKERS = GIRL_STICKERS
