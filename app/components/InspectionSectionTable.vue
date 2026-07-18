<script setup lang="ts">
import type { ReportSection } from '~/utils/inspection-report'
import { ISSUE_OPTIONS, SEVERITY_OPTIONS, createCheckRow } from '~/utils/inspection-report'

const section = defineModel<ReportSection>({ required: true })

function addRow() {
  section.value.rows.push(createCheckRow())
}

function removeRow(index: number) {
  if (section.value.rows.length <= 1) {
    return
  }
  section.value.rows.splice(index, 1)
}
</script>

<template>
  <div class="overflow-x-auto rounded-xl border border-[var(--fung-border)] bg-white shadow-sm">
    <table class="fung-table w-full min-w-[920px] border-collapse text-base">
      <thead>
        <tr class="fung-table-head">
          <th class="w-[18%] px-5 py-5 text-left text-base font-semibold">
            檢查位置
          </th>
          <th class="w-[16%] px-5 py-5 text-left text-base font-semibold">
            問題/狀況
          </th>
          <th class="w-[14%] px-5 py-5 text-left text-base font-semibold">
            狀態/嚴重程度
          </th>
          <th class="w-[36%] px-5 py-5 text-left text-base font-semibold">
            補充說明
          </th>
          <th class="w-[12%] px-5 py-5 text-center text-base font-semibold">
            需要拍照
          </th>
          <th class="w-[4%] px-2 py-5" />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in section.rows"
          :key="row.id"
          class="fung-table-row border-t border-[var(--fung-border)] align-top"
        >
          <td class="px-4 py-5">
            <UInput
              v-model="row.location"
              placeholder="檢查位置"
              size="lg"
              class="w-full"
            />
          </td>
          <td class="px-4 py-5">
            <USelect
              v-model="row.issue"
              :items="[...ISSUE_OPTIONS]"
              placeholder="請選擇"
              size="lg"
              class="w-full"
            />
          </td>
          <td class="px-4 py-5">
            <USelect
              v-model="row.severity"
              :items="[...SEVERITY_OPTIONS]"
              placeholder="請選擇"
              size="lg"
              class="w-full"
            />
          </td>
          <td class="px-4 py-5">
            <UTextarea
              v-model="row.notes"
              :rows="2"
              :maxlength="100"
              placeholder="補充說明（最多100字）"
              size="lg"
              class="w-full"
            />
            <p class="mt-1 text-right text-xs text-[var(--fung-secondary)]">
              {{ row.notes.length }}/100
            </p>
          </td>
          <td class="px-4 py-5">
            <div class="flex flex-col items-center justify-center gap-2 py-2">
              <UCheckbox
                v-model="row.needsPhoto"
                label="TICK"
                size="lg"
              />
              <UBadge
                v-if="row.needsPhoto"
                color="primary"
                variant="subtle"
                size="sm"
              >
                需拍照
              </UBadge>
            </div>
          </td>
          <td class="px-2 py-5 text-center">
            <UButton
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              size="md"
              :disabled="section.rows.length <= 1"
              aria-label="刪除此行"
              @click="removeRow(index)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="mt-5">
    <UButton
      icon="i-lucide-plus"
      label="新增檢查項目"
      color="primary"
      variant="soft"
      size="lg"
      @click="addRow"
    />
  </div>
</template>

<style scoped>
.fung-table-head {
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
  color: #fff;
}

.fung-table-head th {
  border-bottom: 2px solid #172554;
}

.fung-table-row:nth-child(even) {
  background-color: #f8fafc;
}

.fung-table-row:hover {
  background-color: #eff6ff;
}
</style>
