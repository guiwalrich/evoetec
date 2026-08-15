// src/components/ui/pixel-avatar.tsx
import Image from "next/image"

interface PixelAvatarProps {
  id?: number // 1 to 16
  size?: number // e.g. 32, 40, 48, 64
  className?: string
  alt?: string
}

export function PixelAvatar({ id = 1, size = 40, className = "", alt = "User Avatar" }: PixelAvatarProps) {
  // Normalize id between 1 and 16
  const avatarId = Math.max(1, Math.min(16, ((id - 1) % 16) + 1))
  const imagePath = `/assets/avatars/avatar_${avatarId}.png`

  return (
    <div 
      className={`relative rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={imagePath}
        alt={alt}
        className="w-full h-full object-cover rendering-pixelated"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  )
}
