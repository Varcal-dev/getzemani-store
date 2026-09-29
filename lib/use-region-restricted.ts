"use client"

import { useEffect, useState } from "react"
import { getCountryCookie, isRegionRestricted } from "@/lib/region"

export function useRegionRestricted() {
  const [restricted, setRestricted] = useState(false)

  useEffect(() => {
    setRestricted(isRegionRestricted(getCountryCookie()))
  }, [])

  return restricted
}
