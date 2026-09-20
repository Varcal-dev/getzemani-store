"use client"

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react"

export function Reveal({
  children,
  className = "",
  as,
  ...rest
}: {
  children: ReactNode
  className?: string
  as?: ElementType
  [key: string]: any
}) {
  const Tag: ElementType = as || "div"
  const Component = Tag as any
  const ref = useRef<HTMLElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <Component ref={ref} className={`reveal ${visible ? "is-visible" : ""} ${className}`} {...rest}>
      {children}
    </Component>
  )
}
