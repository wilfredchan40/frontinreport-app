<script setup lang="ts">
import type { GalleryPhoto, InspectionReport } from '~/utils/inspection-report'
import {
  createPhotoId,
  findRowContext,
  getPhotoRequiredRows,
  getRowLabel
} from '~/utils/inspection-report'

const report = defineModel<InspectionReport>({ required: true })

const pendingFiles = ref<File[] | null>(null)

const linkedRowOptions = computed(() => getPhotoRequiredRows(report.value))

const unlinkedTickedCount = computed(() => {
  const linkedIds = new Set(
    report.value.galleryPhotos
      .map(p => p.linkedRowId)
      .filter((id): id is string => Boolean(id))
  )
  return linkedRowOptions.value.filter(opt => !linkedIds.has(opt.rowId)).length
})

function getPhotoLabel(photo: GalleryPhoto): string {
  if (!photo.linkedRowId) {
    return '未連結項目'
  }
  const ctx = findRowContext(report.value, photo.linkedRowId)
  return ctx ? getRowLabel(ctx.section, ctx.row) : '已連結項目'
}

function getPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

function onFilesSelected(files: File[] | null | undefined) {
  if (!files?.length) {
    return
  }

  const defaultRowId = linkedRowOptions.value[0]?.rowId

  for (const file of files) {
    report.value.galleryPhotos.push({
      id: createPhotoId(),
      file,
      linkedRowId: defaultRowId
    })
  }

  pendingFiles.value = null
}

function removePhoto(photoId: string) {
  const index = report.value.galleryPhotos.findIndex(p => p.id === photoId)
  if (index >= 0) {
    report.value.galleryPhotos.splice(index, 1)
  }
}
</script>

<template>
  <div class="space-y-6">
    <UAlert
      v-if="linkedRowOptions.length === 0"
      color="warning"
      variant="soft"
      icon="i-lucide-camera-off"
      title="尚未標記需拍照項目"
      description="請先在檢查表格勾選「需要拍照 TICK」，再上傳相片並連結至對應項目。"
      class="rounded-xl"
    />

    <UAlert
      v-else-if="unlinkedTickedCount > 0"
      color="primary"
      variant="soft"
      icon="i-lucide-link"
      :title="`${unlinkedTickedCount} 個需拍照項目尚未連結相片`"
      description="上傳後請為每張相片選擇對應的檢查項目。"
      class="rounded-xl"
    />

    <div
      v-if="linkedRowOptions.length"
      class="rounded-xl border border-dashed border-brand-300 bg-brand-50/50 p-5"
    >
      <p class="mb-3 text-sm font-semibold text-[var(--fung-heading)]">
        已標記需拍照的檢查項目（{{ linkedRowOptions.length }} 項）
      </p>
      <ul class="flex flex-wrap gap-2">
        <li
          v-for="opt in linkedRowOptions"
          :key="opt.rowId"
        >
          <UBadge color="primary" variant="subtle" size="md">
            {{ opt.label }}
          </UBadge>
        </li>
      </ul>
    </div>

    <UFormField label="上傳驗樓相片" name="galleryUpload">
      <UFileUpload
        v-model="pendingFiles"
        multiple
        accept="image/*"
        layout="list"
        label="選擇或拖放相片"
        description="支援多選；顯示與 PDF 均以 16:9 裁切呈現"
        class="w-full rounded-xl"
        @update:model-value="onFilesSelected"
      />
    </UFormField>

    <div v-if="report.galleryPhotos.length" class="space-y-4">
      <h3 class="text-base font-semibold text-[var(--fung-heading)]">
        已上傳相片（{{ report.galleryPhotos.length }} 張）
      </h3>

      <div
        v-for="photo in report.galleryPhotos"
        :key="photo.id"
        class="flex flex-col gap-4 rounded-xl border border-[var(--fung-border)] bg-[var(--fung-bg)] p-5 shadow-sm sm:flex-row sm:items-start"
      >
        <img
          :src="getPreviewUrl(photo.file)"
          :alt="photo.file.name"
          class="aspect-video w-48 shrink-0 rounded-lg border border-[var(--fung-border)] object-cover shadow-sm"
        >

        <div class="min-w-0 flex-1 space-y-3">
          <p class="truncate text-sm text-[var(--fung-secondary)]">
            {{ photo.file.name }}
          </p>

          <UFormField label="連結檢查項目" :name="`photo-link-${photo.id}`">
            <USelect
              v-model="photo.linkedRowId"
              :items="linkedRowOptions"
              value-key="rowId"
              label-key="label"
              placeholder="選擇對應檢查項目"
              size="md"
              :disabled="!linkedRowOptions.length"
              class="w-full"
            />
          </UFormField>

          <p v-if="photo.linkedRowId" class="text-sm text-[var(--fung-secondary)]">
            已連結：{{ getPhotoLabel(photo) }}
          </p>
        </div>

        <UButton
          icon="i-lucide-trash-2"
          color="error"
          variant="ghost"
          size="md"
          aria-label="刪除相片"
          @click="removePhoto(photo.id)"
        />
      </div>
    </div>

    <p
      v-else
      class="rounded-xl border border-dashed border-[var(--fung-border)] py-8 text-center text-sm text-[var(--fung-secondary)]"
    >
      暫無上傳相片
    </p>
  </div>
</template>
