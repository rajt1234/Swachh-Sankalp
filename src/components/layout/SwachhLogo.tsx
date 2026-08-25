'use client'

interface SwachhLogoProps {
  size?: number
}

export function SwachhLogo({ size = 80 }: SwachhLogoProps) {
  return (
    <img
      src="/swachh-logo.png"
      alt="Swachh Bharat Abhiyan"
      width={size}
      height={size}
      className="object-contain"
      style={{ width: size, height: size }}
    />
  )
}
