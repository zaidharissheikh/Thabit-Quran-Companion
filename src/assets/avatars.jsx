import pfp1 from './pfp1.png'
import pfp2 from './pfp2.png'
import pfp3 from './pfp3.png'
import pfp4 from './pfp4.png'

/** Profile picture options (PFP1–PFP4) */
export const AVATAR_OPTIONS = [
  { id: 'pfp1', label: 'The Scholar',  src: pfp1 },
  { id: 'pfp2', label: 'The Reciter',  src: pfp2 },
  { id: 'pfp3', label: 'The Seeker',   src: pfp3 },
  { id: 'pfp4', label: 'The Pilgrim',  src: pfp4 },
]

const LEGACY_AVATAR_IDS = {
  quran: 'pfp1',
  prayer: 'pfp2',
  lantern: 'pfp3',
  crescent: 'pfp4',
}

export function resolveAvatarId(id) {
  if (!id) return AVATAR_OPTIONS[0].id
  if (LEGACY_AVATAR_IDS[id]) return LEGACY_AVATAR_IDS[id]
  if (AVATAR_OPTIONS.some((opt) => opt.id === id)) return id
  return AVATAR_OPTIONS[0].id
}

export function getAvatarOption(id) {
  const resolved = resolveAvatarId(id)
  return AVATAR_OPTIONS.find((a) => a.id === resolved) || AVATAR_OPTIONS[0]
}

export function AvatarBadge({ id, className = 'w-full h-full', alt = 'Avatar' }) {
  const option = getAvatarOption(id)
  return (
    <img
      src={option.src}
      alt={alt}
      className={`object-cover object-center bg-[#0a3d2e] ${className}`}
      draggable={false}
    />
  )
}
