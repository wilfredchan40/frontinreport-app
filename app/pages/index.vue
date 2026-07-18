<script setup lang="ts">
import InspectionPhotoGallery from '~/components/InspectionPhotoGallery.vue'
import InspectionSectionTable from '~/components/InspectionSectionTable.vue'
import { generateInspectionPdf, previewInspectionPdf } from '~/utils/generate-inspection-pdf'
import {
  SECTION_ICONS,
  createInitialReport,
  formatUnitAddress,
  getPhotoRequiredRows,
  getReportProgress,
  type InspectionReport
} from '~/utils/inspection-report'

definePageMeta({
  layout: 'report'
})

useHead({
  title: '新建豐業專業驗樓報告'
})

type ActivePanel = 'basic' | 'photos' | string

const toast = useToast()
const { saveDraft, applyDraft, hasDraft } = useReportDraft()

const report = ref<InspectionReport>(createInitialReport())
const activePanel = ref<ActivePanel>('basic')
const isSavingDraft = ref(false)
const isGeneratingPdf = ref(false)
const isPreviewingPdf = ref(false)

const progress = computed(() => getReportProgress(report.value))
const photoRequiredCount = computed(() => getPhotoRequiredRows(report.value).length)

const headerDate = computed(() => {
  const { reportDate, reportTime } = report.value.basicInfo
  if (reportDate && reportTime) {
    return `${reportDate} ${reportTime}`
  }
  return reportDate || new Date().toLocaleDateString('zh-HK')
})

const headerInspector = computed(
  () => report.value.basicInfo.inspectorName.trim() || '驗樓師'
)

onMounted(() => {
  if (hasDraft()) {
    applyDraft(report)
    toast.add({
      title: '已載入草稿',
      description: '已還原上次儲存的報告資料',
      color: 'primary',
      icon: 'i-lucide-file-archive'
    })
  }
})

function scrollToPanel(panel: ActivePanel) {
  activePanel.value = panel
  nextTick(() => {
    const el = document.getElementById(`panel-${panel}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function onSaveDraft() {
  isSavingDraft.value = true
  try {
    saveDraft(report.value)
    toast.add({
      title: '草稿已儲存',
      description: '報告資料已儲存至本機',
      color: 'success',
      icon: 'i-lucide-save'
    })
  } finally {
    isSavingDraft.value = false
  }
}

async function runPdfAction(
  action: 'preview' | 'download',
  runner: () => Promise<void>
) {
  const loadingRef = action === 'preview' ? isPreviewingPdf : isGeneratingPdf
  loadingRef.value = true
  try {
    await runner()
    toast.add({
      title: action === 'preview' ? '已開啟 PDF 預覽' : 'PDF 已下載',
      description:
        action === 'preview'
          ? '請在新視窗查看報告（若被瀏覽器阻擋請允許彈出視窗）'
          : '報告已下載至您的裝置',
      color: 'success',
      icon: action === 'preview' ? 'i-lucide-eye' : 'i-lucide-file-down'
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'PDF 處理時發生錯誤'
    toast.add({
      title: 'PDF 操作失敗',
      description: message,
      color: 'error',
      icon: 'i-lucide-alert-circle'
    })
  } finally {
    loadingRef.value = false
  }
}

function onPreviewPdf() {
  return runPdfAction('preview', () => previewInspectionPdf(report.value))
}

function onDownloadPdf() {
  return runPdfAction('download', () => generateInspectionPdf(report.value))
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[var(--fung-bg)] text-[var(--fung-text)]">
    <!-- 專業頂部 Header -->
    <header class="sticky top-0 z-50 border-b border-[var(--fung-border)] bg-white/95 backdrop-blur">
      <div class="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 lg:px-6 lg:py-5">
        <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div class="flex items-center gap-4">
            <div
              class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-800 text-lg font-bold text-white shadow-md"
              aria-hidden="true"
            >
              豐
            </div>
            <div>
              <p class="text-xs font-medium uppercase tracking-wider text-[var(--fung-secondary)]">
                Fung Yip Professional Inspection
              </p>
              <h1 class="text-xl font-bold text-[var(--fung-heading)] sm:text-2xl">
                豐業專業驗樓
              </h1>
              <p class="mt-0.5 text-sm text-[var(--fung-secondary)]">
                新建驗樓執修報告
              </p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-4 text-base text-[var(--fung-secondary)]">
            <div class="flex items-center gap-2 rounded-lg bg-[var(--fung-bg)] px-3 py-2">
              <UIcon name="i-lucide-user" class="size-4 text-brand-800" />
              <span class="font-medium">{{ headerInspector }}</span>
            </div>
            <div class="flex items-center gap-2 rounded-lg bg-[var(--fung-bg)] px-3 py-2">
              <UIcon name="i-lucide-calendar" class="size-4 text-brand-800" />
              <span class="font-medium">{{ headerDate }}</span>
            </div>
          </div>

          <div class="flex flex-wrap gap-3 xl:justify-end">
            <UButton
              color="neutral"
              variant="outline"
              size="lg"
              icon="i-lucide-save"
              label="儲存草稿"
              class="rounded-xl px-5"
              :loading="isSavingDraft"
              @click="onSaveDraft"
            />
            <UButton
              color="primary"
              variant="soft"
              size="lg"
              icon="i-lucide-eye"
              label="預覽 PDF"
              class="rounded-xl px-5"
              :loading="isPreviewingPdf"
              @click="onPreviewPdf"
            />
            <UButton
              color="success"
              variant="solid"
              size="lg"
              icon="i-lucide-file-down"
              label="生成並下載 PDF"
              class="rounded-xl px-5 shadow-sm"
              :loading="isGeneratingPdf"
              @click="onDownloadPdf"
            />
          </div>
        </div>

        <!-- 完成進度 -->
        <div class="rounded-xl border border-[var(--fung-border)] bg-[var(--fung-bg)] p-5">
          <div class="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span class="text-sm font-semibold text-[var(--fung-heading)]">
              報告完成進度
            </span>
            <span class="text-sm text-[var(--fung-secondary)]">
              {{ progress.completedSections }} / {{ progress.totalSections }} 個檢查區域
              <span v-if="progress.basicComplete" class="text-corp-600"> · 基本資料已完成</span>
            </span>
          </div>
          <UProgress
            :model-value="progress.percent"
            color="primary"
            size="xl"
            class="h-3.5"
          />
          <p class="mt-2 text-right text-sm font-medium text-brand-800">
            {{ progress.percent }}%
          </p>
        </div>
      </div>
    </header>

    <div class="mx-auto flex w-full max-w-[1600px] flex-1 flex-col lg:flex-row">
      <!-- 固定 Sidebar（平板/桌面） -->
      <aside class="hidden w-[19rem] shrink-0 border-r border-[var(--fung-border)] bg-white lg:sticky lg:top-[13.5rem] lg:block lg:h-[calc(100vh-13.5rem)] lg:overflow-y-auto">
        <nav class="space-y-1 p-4">
          <div class="mb-4 rounded-xl border border-[var(--fung-border)] bg-[var(--fung-bg)] p-3">
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="font-semibold text-[var(--fung-heading)]">完成度</span>
              <span class="font-medium text-brand-800">{{ progress.percent }}%</span>
            </div>
            <UProgress :model-value="progress.percent" color="primary" size="sm" />
          </div>
          <p class="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--fung-secondary)]">
            導覽
          </p>

          <button
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left text-base transition-colors"
            :class="
              activePanel === 'basic'
                ? 'bg-brand-800 text-white shadow-md'
                : 'text-[var(--fung-text)] hover:bg-brand-50'
            "
            @click="scrollToPanel('basic')"
          >
            <UIcon
              name="i-lucide-clipboard-list"
              class="size-5 shrink-0"
            />
            <span class="font-medium">基本資料</span>
            <UIcon
              v-if="progress.basicComplete"
              name="i-lucide-check-circle"
              class="ml-auto size-4"
              :class="activePanel === 'basic' ? 'text-white' : 'text-corp-600'"
            />
          </button>

          <p class="mb-2 mt-6 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--fung-secondary)]">
            檢查區域
          </p>

          <button
            v-for="section in report.sections"
            :key="section.id"
            type="button"
            class="flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left text-base transition-colors"
            :class="
              activePanel === section.id
                ? 'bg-brand-800 text-white shadow-md'
                : 'text-[var(--fung-text)] hover:bg-brand-50'
            "
            @click="scrollToPanel(section.id)"
          >
            <UIcon
              :name="SECTION_ICONS[section.id] ?? 'i-lucide-map-pin'"
              class="size-5 shrink-0"
            />
            <span class="font-medium">{{ section.title }}</span>
            <UIcon
              v-if="progress.sectionStatus[section.id]"
              name="i-lucide-check-circle"
              class="ml-auto size-4 shrink-0"
              :class="activePanel === section.id ? 'text-white' : 'text-corp-600'"
            />
          </button>

          <button
            type="button"
            class="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left text-base transition-colors"
            :class="
              activePanel === 'photos'
                ? 'bg-brand-800 text-white shadow-md'
                : 'text-[var(--fung-text)] hover:bg-brand-50'
            "
            @click="scrollToPanel('photos')"
          >
            <UIcon name="i-lucide-camera" class="size-5 shrink-0" />
            <span class="font-medium">驗樓相片</span>
            <UBadge
              v-if="report.galleryPhotos.length"
              :color="activePanel === 'photos' ? 'neutral' : 'primary'"
              variant="subtle"
              size="sm"
              class="ml-auto"
            >
              {{ report.galleryPhotos.length }}
            </UBadge>
          </button>
        </nav>
      </aside>

      <!-- 手機版橫向導覽 -->
      <div class="border-b border-[var(--fung-border)] bg-white lg:hidden">
        <div class="flex gap-2 overflow-x-auto p-3">
          <UButton
            size="sm"
            :color="activePanel === 'basic' ? 'primary' : 'neutral'"
            :variant="activePanel === 'basic' ? 'solid' : 'ghost'"
            label="基本資料"
            class="shrink-0 rounded-lg"
            @click="scrollToPanel('basic')"
          />
          <UButton
            v-for="section in report.sections"
            :key="section.id"
            size="sm"
            :color="activePanel === section.id ? 'primary' : 'neutral'"
            :variant="activePanel === section.id ? 'solid' : 'ghost'"
            :label="section.title"
            class="shrink-0 rounded-lg"
            @click="scrollToPanel(section.id)"
          />
          <UButton
            size="sm"
            :color="activePanel === 'photos' ? 'primary' : 'neutral'"
            :variant="activePanel === 'photos' ? 'solid' : 'ghost'"
            label="相片"
            class="shrink-0 rounded-lg"
            @click="scrollToPanel('photos')"
          />
        </div>
      </div>

      <!-- 主內容區 -->
      <main class="min-w-0 flex-1 p-4 lg:p-8 xl:p-10">
        <div class="space-y-10">
          <!-- 基本資料 -->
          <section id="panel-basic">
            <UCard
              class="rounded-xl shadow-sm ring-1 ring-[var(--fung-border)]"
              :ui="{ root: 'bg-white', body: 'p-6 sm:p-8', header: 'px-6 sm:px-8 pt-6 sm:pt-8' }"
            >
              <template #header>
                <div class="flex items-center gap-3">
                  <div class="flex size-10 items-center justify-center rounded-lg bg-brand-100 text-brand-800">
                    <UIcon name="i-lucide-clipboard-list" class="size-5" />
                  </div>
                  <div>
                    <h2 class="text-2xl font-bold text-[var(--fung-heading)]">
                      基本資料
                    </h2>
                    <p class="text-sm text-[var(--fung-secondary)]">
                      物業及驗樓師資料
                    </p>
                  </div>
                </div>
              </template>

              <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <UFormField label="屋苑名稱" name="estateName" required size="lg">
                  <UInput
                    v-model="report.basicInfo.estateName"
                    placeholder="屋苑名稱"
                    size="lg"
                  />
                </UFormField>

                <UFormField label="座" name="block" size="lg">
                  <UInput
                    v-model="report.basicInfo.block"
                    placeholder="例如：A座"
                    size="lg"
                  />
                </UFormField>

                <UFormField label="樓" name="floor" size="lg">
                  <UInput
                    v-model="report.basicInfo.floor"
                    placeholder="例如：20"
                    size="lg"
                  />
                </UFormField>

                <UFormField label="室" name="unit" size="lg">
                  <UInput
                    v-model="report.basicInfo.unit"
                    placeholder="例如：B室"
                    size="lg"
                  />
                </UFormField>

                <UFormField label="業主名稱" name="ownerName" size="lg">
                  <UInput
                    v-model="report.basicInfo.ownerName"
                    placeholder="業主姓名"
                    size="lg"
                  />
                </UFormField>

                <UFormField label="報告日期" name="reportDate" size="lg">
                  <UInput
                    v-model="report.basicInfo.reportDate"
                    type="date"
                    size="lg"
                  />
                </UFormField>

                <UFormField label="報告時間" name="reportTime" size="lg">
                  <UInput
                    v-model="report.basicInfo.reportTime"
                    type="time"
                    size="lg"
                  />
                </UFormField>

                <UFormField label="驗樓師姓名" name="inspectorName" required size="lg">
                  <UInput
                    v-model="report.basicInfo.inspectorName"
                    placeholder="驗樓師姓名"
                    size="lg"
                  />
                </UFormField>

                <UFormField label="驗樓師電話" name="inspectorPhone" size="lg">
                  <UInput
                    v-model="report.basicInfo.inspectorPhone"
                    type="tel"
                    placeholder="聯絡電話"
                    size="lg"
                  />
                </UFormField>
              </div>

              <p
                v-if="report.basicInfo.estateName"
                class="mt-6 rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-900"
              >
                單位摘要：{{ report.basicInfo.estateName }}
                <span v-if="formatUnitAddress(report.basicInfo) !== '—'">
                  · {{ formatUnitAddress(report.basicInfo) }}
                </span>
              </p>
            </UCard>
          </section>

          <!-- 各檢查區域 -->
          <section
            v-for="(section, index) in report.sections"
            :id="`panel-${section.id}`"
            :key="section.id"
          >
            <UCard
              class="rounded-xl shadow-sm ring-1 ring-[var(--fung-border)]"
              :class="{ 'ring-2 ring-brand-400': activePanel === section.id }"
              :ui="{ root: 'bg-white', body: 'p-6 sm:p-8', header: 'px-6 sm:px-8 pt-6 sm:pt-8' }"
            >
              <template #header>
                <div class="flex flex-wrap items-start justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <div class="flex size-11 items-center justify-center rounded-xl bg-brand-800 text-white shadow-sm">
                      <UIcon
                        :name="SECTION_ICONS[section.id] ?? 'i-lucide-map-pin'"
                        class="size-5"
                      />
                    </div>
                    <div>
                      <h2 class="text-2xl font-bold text-[var(--fung-heading)]">
                        {{ section.title }}
                      </h2>
                      <p class="text-sm text-[var(--fung-secondary)]">
                        {{ section.rows.length }} 項檢查 ·
                        <span v-if="progress.sectionStatus[section.id]" class="text-corp-600 font-medium">
                          已完成
                        </span>
                        <span v-else>待填寫</span>
                      </p>
                    </div>
                  </div>
                  <UBadge
                    v-if="progress.sectionStatus[section.id]"
                    color="success"
                    variant="subtle"
                    size="md"
                    icon="i-lucide-check"
                  >
                    完成
                  </UBadge>
                </div>
              </template>

              <InspectionSectionTable v-model="report.sections[index]!" />
            </UCard>
          </section>

          <!-- 相片上傳 -->
          <section id="panel-photos">
            <UCard
              class="rounded-xl shadow-sm ring-1 ring-[var(--fung-border)]"
              :ui="{ root: 'bg-white', body: 'p-6 sm:p-8', header: 'px-6 sm:px-8 pt-6 sm:pt-8' }"
            >
              <template #header>
                <div class="flex items-center gap-3">
                  <div class="flex size-10 items-center justify-center rounded-lg bg-brand-100 text-brand-800">
                    <UIcon name="i-lucide-camera" class="size-5" />
                  </div>
                  <div>
                    <h2 class="text-2xl font-bold text-[var(--fung-heading)]">
                      驗樓照片上傳
                    </h2>
                    <p class="text-sm text-[var(--fung-secondary)]">
                      需拍照項目 {{ photoRequiredCount }} 項 · 已上傳 {{ report.galleryPhotos.length }} 張
                    </p>
                  </div>
                </div>
              </template>

              <InspectionPhotoGallery v-model="report" />
            </UCard>
          </section>
        </div>

        <!-- 底部操作列 -->
        <div
          class="sticky bottom-4 z-20 mt-10 flex flex-wrap justify-end gap-3 rounded-xl border border-[var(--fung-border)] bg-white/95 p-4 shadow-lg backdrop-blur"
        >
          <UButton
            color="neutral"
            variant="outline"
            size="lg"
            icon="i-lucide-save"
            label="儲存草稿"
            class="rounded-xl"
            :loading="isSavingDraft"
            @click="onSaveDraft"
          />
          <UButton
            color="primary"
            variant="soft"
            size="lg"
            icon="i-lucide-eye"
            label="預覽 PDF"
            class="rounded-xl"
            :loading="isPreviewingPdf"
            @click="onPreviewPdf"
          />
          <UButton
            color="success"
            size="lg"
            icon="i-lucide-file-down"
            label="生成並下載 PDF"
            class="rounded-xl shadow-md"
            :loading="isGeneratingPdf"
            @click="onDownloadPdf"
          />
        </div>
      </main>
    </div>
  </div>
</template>
