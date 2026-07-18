export type IssueType =
  | 'satisfied'
  | 'stain'
  | 'chip'
  | 'crack'
  | 'sealant'
  | 'malfunction'
  | 'leak'
  | 'hollow'
  | 'loose_screw'
  | 'other'
  | undefined

export type SeverityLevel = 'light' | 'medium' | 'serious' | 'replace' | undefined

export interface CheckItemRow {
  id: string
  location: string
  issue: IssueType
  severity: SeverityLevel
  notes: string
  needsPhoto: boolean
}

export interface GalleryPhoto {
  id: string
  file: File
  linkedRowId: string | undefined
}

export interface ReportSection {
  id: string
  title: string
  rows: CheckItemRow[]
}

export interface BasicInfo {
  estateName: string
  block: string
  floor: string
  unit: string
  ownerName: string
  reportDate: string
  reportTime: string
  inspectorName: string
  inspectorPhone: string
}

export interface InspectionReport {
  basicInfo: BasicInfo
  sections: ReportSection[]
  galleryPhotos: GalleryPhoto[]
}

export interface LinkedRowOption {
  rowId: string
  label: string
  sectionId: string
  sectionTitle: string
}

export const ISSUE_OPTIONS = [
  { label: '滿意', value: 'satisfied' },
  { label: '污漬', value: 'stain' },
  { label: '崩花', value: 'chip' },
  { label: '裂紋', value: 'crack' },
  { label: '補膠', value: 'sealant' },
  { label: '失靈', value: 'malfunction' },
  { label: '漏水', value: 'leak' },
  { label: '空鼓', value: 'hollow' },
  { label: '螺絲鬆脫', value: 'loose_screw' },
  { label: '其他', value: 'other' }
] as const

export const SEVERITY_OPTIONS = [
  { label: '輕微', value: 'light' },
  { label: '中等', value: 'medium' },
  { label: '嚴重', value: 'serious' },
  { label: '建議更換', value: 'replace' }
] as const

export const SECTION_DEFINITIONS: { id: string; title: string; locations: string[] }[] = [
  {
    id: 'main-door-outside',
    title: '大門外',
    locations: ['鎖', '防盜眼', '門鈴', '門身外', '門框', '門底防煙條', '門鉸', '進門雲石條']
  },
  {
    id: 'main-door-inside',
    title: '大門內',
    locations: ['門鎖手把', '門鼓', '防盜鏈', '防盜眼', '門鈴聲響', '門身內', '門框防塵防火條', '門底防煙條']
  },
  {
    id: 'foyer',
    title: '玄關',
    locations: ['地板地磚', '天花', '牆身', '門口柜', '對講機']
  },
  {
    id: 'kitchen',
    title: '廚房',
    locations: [
      '地板地磚',
      '天花',
      '牆身',
      '工作台面',
      '所有燈具',
      '鋅盆',
      '水喉',
      '止水位',
      '廚櫃內',
      '抽油煙機',
      '地渠口'
    ]
  },
  {
    id: 'living-dining',
    title: '客飯廳',
    locations: [
      '地板地磚',
      '天花',
      '牆身',
      '所有燈具',
      '窗框',
      '玻璃窗',
      '冷氣機',
      '窗簾軌',
      '電掣插座',
      '電視插座'
    ]
  },
  {
    id: 'living-balcony',
    title: '大廳露台',
    locations: ['地台地磚', '欄杆', '玻璃', '去水', '欄杆螺絲', '牆身', '天花']
  },
  {
    id: 'master-bedroom',
    title: '主人房',
    locations: [
      '地板地磚',
      '天花',
      '牆身',
      '所有燈具',
      '窗框',
      '玻璃窗',
      '冷氣機',
      '衣櫃內',
      '衣櫃門',
      '電掣插座'
    ]
  },
  {
    id: 'master-bathroom',
    title: '主人房浴室',
    locations: [
      '地板地磚',
      '牆身瓷磚',
      '天花',
      '浴缸/企缸',
      '淋浴花灑',
      '坐廁',
      '洗手盆',
      '鏡櫃',
      '水喉',
      '地渠口',
      '抽氣扇',
      '所有燈具'
    ]
  },
  {
    id: 'bedroom-balcony',
    title: '主人房/房間露台',
    locations: ['地台地磚', '欄杆', '玻璃', '去水', '牆身', '天花']
  },
  {
    id: 'others',
    title: '其他',
    locations: ['其他項目（一）', '其他項目（二）', '其他項目（三）']
  }
]

let rowIdCounter = 0
let photoIdCounter = 0

export function createRowId(): string {
  rowIdCounter += 1
  return `row-${rowIdCounter}-${Date.now()}`
}

export function createPhotoId(): string {
  photoIdCounter += 1
  return `photo-${photoIdCounter}-${Date.now()}`
}

export function createCheckRow(location = ''): CheckItemRow {
  return {
    id: createRowId(),
    location,
    issue: undefined,
    severity: undefined,
    notes: '',
    needsPhoto: false
  }
}

export function createSection(def: { id: string; title: string; locations: string[] }): ReportSection {
  return {
    id: def.id,
    title: def.title,
    rows: def.locations.map(location => createCheckRow(location))
  }
}

export function createInitialReport(): InspectionReport {
  return {
    basicInfo: {
      estateName: '',
      block: '',
      floor: '',
      unit: '',
      ownerName: '',
      reportDate: new Date().toISOString().slice(0, 10),
      reportTime: new Date().toTimeString().slice(0, 5),
      inspectorName: '',
      inspectorPhone: ''
    },
    sections: SECTION_DEFINITIONS.map(createSection),
    galleryPhotos: []
  }
}

export const ALL_SECTION_IDS = SECTION_DEFINITIONS.map(s => s.id)

/** 各檢查區域對應圖示 */
export const SECTION_ICONS: Record<string, string> = {
  'main-door-outside': 'i-lucide-door-open',
  'main-door-inside': 'i-lucide-door-closed',
  foyer: 'i-lucide-home',
  kitchen: 'i-lucide-cooking-pot',
  'living-dining': 'i-lucide-sofa',
  'living-balcony': 'i-lucide-sun',
  'master-bedroom': 'i-lucide-bed-double',
  'master-bathroom': 'i-lucide-bath',
  'bedroom-balcony': 'i-lucide-trees',
  others: 'i-lucide-clipboard-list'
}

export function isRowFilled(row: CheckItemRow): boolean {
  return row.issue !== undefined
}

export function isSectionComplete(section: ReportSection): boolean {
  return section.rows.length > 0 && section.rows.every(isRowFilled)
}

export function isBasicInfoComplete(info: BasicInfo): boolean {
  return Boolean(info.estateName.trim() && info.inspectorName.trim())
}

export interface ReportProgress {
  completedSections: number
  totalSections: number
  basicComplete: boolean
  percent: number
  sectionStatus: Record<string, boolean>
}

export function getReportProgress(report: InspectionReport): ReportProgress {
  const sectionStatus: Record<string, boolean> = {}
  let completedSections = 0

  for (const section of report.sections) {
    const done = isSectionComplete(section)
    sectionStatus[section.id] = done
    if (done) {
      completedSections += 1
    }
  }

  const totalSections = report.sections.length
  const basicComplete = isBasicInfoComplete(report.basicInfo)
  const sectionWeight = totalSections > 0 ? (completedSections / totalSections) * 90 : 0
  const basicWeight = basicComplete ? 10 : 0
  const percent = Math.min(100, Math.round(sectionWeight + basicWeight))

  return {
    completedSections,
    totalSections,
    basicComplete,
    percent,
    sectionStatus
  }
}

export function formatUnitAddress(info: BasicInfo): string {
  const parts = [info.block, info.floor, info.unit].filter(Boolean)
  return parts.length ? parts.join(' / ') : '—'
}

export function getRowLabel(section: ReportSection, row: CheckItemRow): string {
  const location = row.location.trim() || '未命名位置'
  return `${section.title} — ${location}`
}

export function getPhotoRequiredRows(report: InspectionReport): LinkedRowOption[] {
  const options: LinkedRowOption[] = []
  for (const section of report.sections) {
    for (const row of section.rows) {
      if (row.needsPhoto) {
        options.push({
          rowId: row.id,
          label: getRowLabel(section, row),
          sectionId: section.id,
          sectionTitle: section.title
        })
      }
    }
  }
  return options
}

export function findRowContext(
  report: InspectionReport,
  rowId: string
): { section: ReportSection; row: CheckItemRow } | undefined {
  for (const section of report.sections) {
    const row = section.rows.find(r => r.id === rowId)
    if (row) {
      return { section, row }
    }
  }
  return undefined
}

export function getIssueLabel(value: IssueType): string {
  if (!value) {
    return '—'
  }
  return ISSUE_OPTIONS.find(o => o.value === value)?.label ?? value
}

export function getSeverityLabel(value: SeverityLevel): string {
  if (!value) {
    return '—'
  }
  return SEVERITY_OPTIONS.find(o => o.value === value)?.label ?? value
}
