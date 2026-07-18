import type { InspectionReport } from '~/utils/inspection-report'
import { createInitialReport } from '~/utils/inspection-report'

const DRAFT_STORAGE_KEY = 'fung-yip-inspection-draft-v1'

interface DraftPayload {
  basicInfo: InspectionReport['basicInfo']
  sections: InspectionReport['sections']
  savedAt: string
}

export function useReportDraft() {
  function saveDraft(report: InspectionReport): void {
    if (import.meta.server) {
      return
    }

    const payload: DraftPayload = {
      basicInfo: { ...report.basicInfo },
      sections: JSON.parse(JSON.stringify(report.sections)) as InspectionReport['sections'],
      savedAt: new Date().toISOString()
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(payload))
  }

  function loadDraft(): DraftPayload | null {
    if (import.meta.server) {
      return null
    }

    const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) {
      return null
    }

    try {
      return JSON.parse(raw) as DraftPayload
    } catch {
      return null
    }
  }

  function applyDraft(report: Ref<InspectionReport>): boolean {
    const draft = loadDraft()
    if (!draft) {
      return false
    }

    report.value.basicInfo = { ...draft.basicInfo }
    report.value.sections = draft.sections
    return true
  }

  function clearDraft(): void {
    if (import.meta.server) {
      return
    }
    localStorage.removeItem(DRAFT_STORAGE_KEY)
  }

  function hasDraft(): boolean {
    return Boolean(loadDraft())
  }

  return {
    saveDraft,
    loadDraft,
    applyDraft,
    clearDraft,
    hasDraft,
    createInitialReport
  }
}
