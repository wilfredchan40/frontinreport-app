import type { Content, TDocumentDefinitions } from 'pdfmake/interfaces'
import type { InspectionReport } from '~/utils/inspection-report'
import {
  findRowContext,
  formatUnitAddress,
  getIssueLabel,
  getPhotoRequiredRows,
  getRowLabel,
  getSeverityLabel
} from '~/utils/inspection-report'
import { arrayBufferToBase64, fileTo9x16DataUrl } from '~/utils/file-to-base64'

/** PDF 相片顯示尺寸（9:16 直向） */
const PDF_PHOTO_WIDTH = 90
const PDF_PHOTO_HEIGHT = 160

const FONT_CACHE_KEY = 'noto-sans-tc-pdf-vfs'
const FONT_FILE = 'NotoSansTC-Regular.ttf'
const FONT_URL =
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-sans-tc@5.2.5/chinese-traditional-400-normal.ttf'

const PDF_FONT = 'NotoSansTC'

interface PdfDocumentHandle {
  download: (filename?: string) => Promise<void>
  open: (win?: Window | null) => Promise<void>
}

interface PdfMakeClient {
  createPdf: (doc: TDocumentDefinitions) => PdfDocumentHandle
  addVirtualFileSystem: (vfs: Record<string, string>) => void
  addFonts: (fonts: Record<string, { normal: string; bold: string; italics: string; bolditalics: string }>) => void
}

async function loadPdfMake(): Promise<PdfMakeClient> {
  const pdfMakeModule = await import('pdfmake/build/pdfmake')
  const pdfMake = pdfMakeModule.default as unknown as PdfMakeClient
  const vfsModule = await import('pdfmake/build/vfs_fonts')
  const vfs = vfsModule.default as Record<string, string>

  pdfMake.addVirtualFileSystem(vfs)

  let fontBase64 = sessionStorage.getItem(FONT_CACHE_KEY)
  if (!fontBase64) {
    const response = await fetch(FONT_URL)
    if (!response.ok) {
      throw new Error('無法載入中文字型，請檢查網絡連線後重試')
    }
    fontBase64 = arrayBufferToBase64(await response.arrayBuffer())
    sessionStorage.setItem(FONT_CACHE_KEY, fontBase64)
  }

  pdfMake.addVirtualFileSystem({ [FONT_FILE]: fontBase64 })
  pdfMake.addFonts({
    [PDF_FONT]: {
      normal: FONT_FILE,
      bold: FONT_FILE,
      italics: FONT_FILE,
      bolditalics: FONT_FILE
    }
  })

  return pdfMake
}

function formatReportDateTime(report: InspectionReport): string {
  const { reportDate, reportTime } = report.basicInfo
  if (reportDate && reportTime) {
    return `${reportDate} ${reportTime}`
  }
  return reportDate || reportTime || '—'
}

function buildBasicInfoTable(report: InspectionReport): Content {
  const { basicInfo } = report
  return {
    table: {
      widths: ['22%', '28%', '22%', '28%'],
      body: [
        [
          { text: '屋苑名稱', style: 'tableHeader' },
          { text: basicInfo.estateName || '—', style: 'tableCell' },
          { text: '單位（座/樓/室）', style: 'tableHeader' },
          { text: formatUnitAddress(basicInfo), style: 'tableCell' }
        ],
        [
          { text: '業主名稱', style: 'tableHeader' },
          { text: basicInfo.ownerName || '—', style: 'tableCell' },
          { text: '驗樓師電話', style: 'tableHeader' },
          { text: basicInfo.inspectorPhone || '—', style: 'tableCell' }
        ],
        [
          { text: '報告日期時間', style: 'tableHeader' },
          { text: formatReportDateTime(report), style: 'tableCell' },
          { text: '驗樓師姓名', style: 'tableHeader' },
          { text: basicInfo.inspectorName || '—', style: 'tableCell' }
        ]
      ]
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#cccccc',
      vLineColor: () => '#cccccc',
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 4,
      paddingBottom: () => 4
    },
    margin: [0, 0, 0, 16] as [number, number, number, number]
  }
}

function buildSectionTable(report: InspectionReport): Content[] {
  const blocks: Content[] = []

  for (const section of report.sections) {
    blocks.push({
      text: section.title,
      style: 'sectionTitle',
      margin: [0, 12, 0, 6] as [number, number, number, number]
    })

    const body: Content[][] = [
      [
        { text: '檢查位置', style: 'tableHeader' },
        { text: '問題/狀況', style: 'tableHeader' },
        { text: '狀態/嚴重程度', style: 'tableHeader' },
        { text: '補充說明', style: 'tableHeader' },
        { text: '拍照', style: 'tableHeader' }
      ]
    ]

    for (const row of section.rows) {
      body.push([
        { text: row.location || '—', style: 'tableCell' },
        { text: getIssueLabel(row.issue), style: 'tableCell' },
        { text: getSeverityLabel(row.severity), style: 'tableCell' },
        { text: row.notes || '—', style: 'tableCell' },
        { text: row.needsPhoto ? '✓' : '—', style: 'tableCell', alignment: 'center' }
      ])
    }

    blocks.push({
      table: {
        headerRows: 1,
        widths: ['22%', '16%', '14%', '*', '8%'],
        body
      },
      layout: {
        hLineWidth: (i: number, node: { table: { body: unknown[] } }) =>
          i === 0 || i === 1 || i === node.table.body.length ? 0.8 : 0.4,
        vLineWidth: () => 0.4,
        hLineColor: () => '#cccccc',
        vLineColor: () => '#cccccc',
        fillColor: (rowIndex: number) => (rowIndex === 0 ? '#f0f4f8' : null),
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 3,
        paddingBottom: () => 3
      },
      margin: [0, 0, 0, 4] as [number, number, number, number]
    })
  }

  return blocks
}

async function buildPhotoSection(report: InspectionReport): Promise<Content[]> {
  if (!report.galleryPhotos.length) {
    return [
      {
        text: '驗樓相片',
        style: 'sectionTitle',
        pageBreak: 'before',
        margin: [0, 0, 0, 6] as [number, number, number, number]
      },
      { text: '（暫無上傳相片）', style: 'muted', margin: [0, 0, 0, 8] as [number, number, number, number] }
    ]
  }

  const blocks: Content[] = [
    {
      text: '驗樓相片',
      style: 'sectionTitle',
      pageBreak: 'before',
      margin: [0, 0, 0, 10] as [number, number, number, number]
    }
  ]

  const photosByRow = new Map<string, { label: string; images: Content[] }>()
  const unlinked: Content[] = []

  for (const photo of report.galleryPhotos) {
    const dataUrl = await fileTo9x16DataUrl(photo.file)
    const imageBlock: Content = {
      image: dataUrl,
      width: PDF_PHOTO_WIDTH,
      height: PDF_PHOTO_HEIGHT,
      margin: [0, 4, 8, 4] as [number, number, number, number]
    }

    if (photo.linkedRowId) {
      const ctx = findRowContext(report, photo.linkedRowId)
      const label = ctx ? getRowLabel(ctx.section, ctx.row) : '已連結項目'
      const existing = photosByRow.get(photo.linkedRowId)
      if (existing) {
        existing.images.push(imageBlock)
      } else {
        photosByRow.set(photo.linkedRowId, { label, images: [imageBlock] })
      }
    } else {
      unlinked.push(imageBlock)
    }
  }

  for (const { label, images } of photosByRow.values()) {
    blocks.push({ text: label, style: 'photoGroupTitle', margin: [0, 8, 0, 4] as [number, number, number, number] })
    blocks.push({ columns: images, columnGap: 8 })
  }

  if (unlinked.length) {
    blocks.push({ text: '其他相片', style: 'photoGroupTitle', margin: [0, 12, 0, 4] as [number, number, number, number] })
    blocks.push({ columns: unlinked, columnGap: 8 })
  }

  const tickedWithoutPhoto = getPhotoRequiredRows(report).filter(
    opt => !report.galleryPhotos.some(p => p.linkedRowId === opt.rowId)
  )
  if (tickedWithoutPhoto.length) {
    blocks.push({
      text: `備註：以下項目已標記需拍照但尚未上傳相片：${tickedWithoutPhoto.map(o => o.label).join('、')}`,
      style: 'muted',
      margin: [0, 12, 0, 0] as [number, number, number, number]
    })
  }

  return blocks
}

function buildDocumentDefinition(report: InspectionReport, photoContent: Content[]): TDocumentDefinitions {
  const { basicInfo } = report
  const subtitle = [
    basicInfo.estateName && `屋苑：${basicInfo.estateName}`,
    formatUnitAddress(basicInfo) !== '—' && `單位：${formatUnitAddress(basicInfo)}`
  ]
    .filter(Boolean)
    .join('　')

  return {
    pageSize: 'A4',
    pageMargins: [40, 48, 40, 48],
    defaultStyle: {
      font: PDF_FONT,
      fontSize: 9,
      color: '#1a1a1a'
    },
    styles: {
      title: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 6] },
      subtitle: { fontSize: 10, alignment: 'center', color: '#444444', margin: [0, 0, 0, 4] },
      meta: { fontSize: 9, alignment: 'center', color: '#666666', margin: [0, 0, 0, 16] },
      sectionTitle: { fontSize: 11, bold: true, color: '#1e3a5f' },
      tableHeader: { bold: true, fontSize: 8, fillColor: '#e8eef4', color: '#1a1a1a' },
      tableCell: { fontSize: 8 },
      photoGroupTitle: { fontSize: 9, bold: true, color: '#333333' },
      muted: { fontSize: 8, color: '#888888', italics: true },
      footer: { fontSize: 7, color: '#999999' }
    },
    content: [
      { text: '豐業專業驗樓執修報告', style: 'title' },
      ...(subtitle ? [{ text: subtitle, style: 'subtitle' }] : []),
      {
        text: `報告日期：${formatReportDateTime(report)}　　驗樓師：${basicInfo.inspectorName || '—'}`,
        style: 'meta'
      },
      { text: '基本資料', style: 'sectionTitle', margin: [0, 0, 0, 6] },
      buildBasicInfoTable(report),
      { text: '驗樓檢查項目', style: 'sectionTitle', margin: [0, 8, 0, 8] },
      ...buildSectionTable(report),
      ...photoContent
    ],
    footer: (currentPage, pageCount) => ({
      text: `豐業專業驗樓執修報告　第 ${currentPage} / ${pageCount} 頁`,
      style: 'footer',
      alignment: 'center',
      margin: [0, 8, 0, 0]
    })
  }
}

function buildPdfFilename(report: InspectionReport): string {
  const estate = report.basicInfo.estateName.trim() || '驗樓報告'
  const date = report.basicInfo.reportDate || new Date().toISOString().slice(0, 10)
  return `豐業驗樓報告_${estate}_${date}.pdf`
}

async function createPdfDocument(report: InspectionReport) {
  if (import.meta.server) {
    throw new Error('PDF 生成僅可在瀏覽器端執行')
  }

  const pdfMake = await loadPdfMake()
  const photoContent = await buildPhotoSection(report)
  const docDefinition = buildDocumentDefinition(report, photoContent)
  return pdfMake.createPdf(docDefinition)
}

/** 在新視窗預覽 PDF */
export async function previewInspectionPdf(report: InspectionReport): Promise<void> {
  const pdf = await createPdfDocument(report)
  await pdf.open()
}

/** 生成並下載 PDF 報告（僅限瀏覽器端） */
export async function generateInspectionPdf(report: InspectionReport): Promise<void> {
  const pdf = await createPdfDocument(report)
  await pdf.download(buildPdfFilename(report))
}
