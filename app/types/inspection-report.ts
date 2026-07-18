export type IssueType =
  | 'satisfactory'
  | 'stain'
  | 'chip'
  | 'crack'
  | 'sealant'
  | 'malfunction'
  | 'leak'
  | 'hollow'
  | 'loose_screw'
  | 'other'
  | null

export type StatusSeverity =
  | 'minor'
  | 'moderate'
  | 'serious'
  | 'replace'
  | null

export interface CheckItem {
  id: string
  location: string
  issue: IssueType
  severity: StatusSeverity
  notes: string
  photos: File[] | null
}

export interface InspectionSection {
  id: string
  title: string
  items: CheckItem[]
}

export interface BasicInfo {
  estateName: string
  block: string
  floor: string
  unit: string
  ownerName: string
  reportDate: import('@internationalized/date').DateValue | undefined
  inspectorName: string
  phone: string
}

export const ISSUE_OPTIONS: { label: string; value: Exclude<IssueType, null> }[] = [
  { label: '滿意', value: 'satisfactory' },
  { label: '污漬', value: 'stain' },
  { label: '崩花', value: 'chip' },
  { label: '裂紋', value: 'crack' },
  { label: '補膠', value: 'sealant' },
  { label: '失靈', value: 'malfunction' },
  { label: '漏水', value: 'leak' },
  { label: '空鼓', value: 'hollow' },
  { label: '螺絲鬆脫', value: 'loose_screw' },
  { label: '其他', value: 'other' }
]

export const SEVERITY_OPTIONS: { label: string; value: Exclude<StatusSeverity, null> }[] = [
  { label: '輕微', value: 'minor' },
  { label: '中等', value: 'moderate' },
  { label: '嚴重', value: 'serious' },
  { label: '建議更換', value: 'replace' }
]

let itemIdCounter = 0

export function createCheckItem(location: string): CheckItem {
  itemIdCounter += 1
  return {
    id: `item-${itemIdCounter}`,
    location,
    issue: null,
    severity: null,
    notes: '',
    photos: null
  }
}

export function createSection(id: string, title: string, defaultLocations: string[]): InspectionSection {
  return {
    id,
    title,
    items: defaultLocations.map(createCheckItem)
  }
}

/** 各分區預設檢查項目（空白行亦會顯示，供現場填寫） */
export const DEFAULT_SECTIONS: { id: string; title: string; locations: string[] }[] = [
  {
    id: 'door-outside',
    title: '大門外',
    locations: ['大門', '門框', '門鎖', '門牌', '外牆', '走廊地磚']
  },
  {
    id: 'door-inside',
    title: '大門內',
    locations: ['大門內側', '門檔', '門鎖內側', '門碰', '門邊油漆']
  },
  {
    id: 'foyer',
    title: '玄關',
    locations: ['地磚', '牆身', '天花', '燈具', '櫃門', '電掣/開關']
  },
  {
    id: 'kitchen',
    title: '廚房',
    locations: [
      '地磚',
      '牆磚',
      '天花',
      '廚櫃',
      '枱面',
      '星盤',
      '爐具',
      '抽油煙機',
      '抽氣扇',
      '水喉',
      '窗戶',
      '玻璃'
    ]
  },
  {
    id: 'living-dining',
    title: '客飯廳',
    locations: ['地磚', '牆身', '天花', '燈具', '窗戶', '玻璃', '冷氣位置', '插座/掣']
  },
  {
    id: 'living-balcony',
    title: '大廳露台',
    locations: ['地台', '欄杆', '玻璃', '去水', '趟門/推拉門']
  },
  {
    id: 'master-bedroom',
    title: '主人房',
    locations: ['地磚', '牆身', '天花', '燈具', '窗戶', '冷氣位置', '衣櫃', '插座/掣']
  },
  {
    id: 'master-bathroom',
    title: '主人房浴室',
    locations: [
      '地磚',
      '牆磚',
      '天花',
      '浴缸/企缸',
      '淋浴屏',
      '坐廁',
      '面盆',
      '水喉',
      '鏡櫃',
      '抽氣扇'
    ]
  },
  {
    id: 'bedroom-balcony',
    title: '主人房/房間露台',
    locations: ['地台', '欄杆', '玻璃', '去水', '趟門/推拉門']
  },
  {
    id: 'others',
    title: '其他',
    locations: ['其他項目 (一)', '其他項目 (二)', '其他項目 (三)']
  }
]

export function createInitialSections(): InspectionSection[] {
  return DEFAULT_SECTIONS.map(({ id, title, locations }) =>
    createSection(id, title, locations)
  )
}
