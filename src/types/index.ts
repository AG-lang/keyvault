export interface KeyItem {
  id: string
  name: string
  key: string
  group: string
  note?: string
  pinned?: boolean
  createdAt: number
  lastCopiedAt?: number
}
