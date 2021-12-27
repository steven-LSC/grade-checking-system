<template>
  <div class="group">
    <Alert
      title="注意，礙於各系之間計算方式的差異 :"
      content="本系統只會協助下列統計指標的計算: 學生平均成績、各評委的打分平均、各評委的打分標準差、各組平均、各組標準差、全體學生平均、全體學生標準差。"
    />
  </div>
  <div class="group">
    <Upload>
      <input
        id="file-upload"
        type="file"
        class="sr-only"
        ref="rawFile"
        accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        @change="upload"
      />
    </Upload>
  </div>

  <div class="group">
    <p class="title">幾個表格決定一個學生的成績?</p>
    <p class="note">注意：成績需要按照順序擺放好。</p>
    <input
      v-model.number="setting.numSheetsPerStudent"
      type="text"
      class="text"
      placeholder="ex: 3"
    />
  </div>

  <div class="group">
    <p class="title">成績在哪一行？</p>
    <p class="note">
      選擇您將成績所放置的欄位。
      <br />
      注意：欄位名稱只能有ㄧ列，如果為多列，系統讀取會錯誤。
    </p>
    <select v-model="setting.scoreKey" class="primary">
      <option v-for="(key, index) in studentInfoKeys" :value="key" :key="index">
        {{ key }}
      </option>
    </select>
  </div>

  <div class="group">
    <p class="title">輸出的欄位名稱</p>
    <p class="note">例如：選擇學生姓名，生成的表格將會保留學生姓名。</p>
    <select v-model="setting.outputKeys[0]" class="primary">
      <option v-for="(key, index) in studentInfoKeys" :value="key" :key="index">
        {{ key }}
      </option>
    </select>
    <select v-model="setting.outputKeys[1]" class="primary">
      <option v-for="(key, index) in studentInfoKeys" :value="key" :key="index">
        {{ key }}
      </option>
    </select>
  </div>

  <div class="group">
    <button @click="$router.replace('/')" class="white">返回</button>
    <button @click="download" class="purple">下載</button>
  </div>

  <ModalComplete
    v-if="complete.display"
    :textInButton="complete.textInButton"
    :title="complete.title"
    :content="complete.content"
    @close="complete.display = false"
    @clickButton="complete.display = false"
  />
  <ModalWarning
    v-if="warning.display"
    :textInButton="warning.textInButton"
    :title="warning.title"
    :content="warning.content"
    @close="warning.display = false"
    @clickButton="warning.display = false"
  />
</template>

<script>
import { ref, reactive, computed } from 'vue';
import xlsx from 'xlsx';
import transformScores from './libs/transform-scores';
import spiderman from '@/spiderman';

export default {
  setup() {
    let excel = null;
    const rawFile = ref(null);
    const sheets = ref(null);
    const warning = ref({
      display: false,
      title: '錯誤',
      content: '內容',
      textInButton: '關閉',
    });
    const complete = reactive({
      display: false,
      title: '差分檢核通過',
      content: '恭喜您，並無任何成績異樣。',
      textInButton: '結束',
    });
    const setting = reactive({
      numSheetsPerStudent: null,
      scoreKey: null,
      outputKeys: [],
    });
    const studentInfoKeys = computed(() => (setting.sheetKey ? Object.keys(excel[setting.sheetKey][0]) : []));

    async function upload() {
      try {
        excel = await spiderman.excel.rawFileToObject(rawFile);
        sheets.value = Object.keys(excel);
        [setting.sheetKey] = Object.keys(excel);
      } catch (error) {
        warning.value = {
          display: true,
          title: '錯誤',
          content: error.message,
          textInButton: '關閉',
        };
      }
    }

    function download() {
      try {
        const { scoreKey, outputKeys, numSheetsPerStudent } = setting;

        const groupsOfStudents = transformScores.multipleSheets({
          excel,
          numSheetsPerStudent,
          scoreKey,
          outputKeys,
        });

        const workbook = xlsx.utils.book_new();

        groupsOfStudents.forEach((groupOfStudents, index) => {
          const worksheet = xlsx.utils.json_to_sheet(groupOfStudents);
          xlsx.utils.book_append_sheet(workbook, worksheet, `第${index + 1}組`);
        });

        xlsx.writeFile(workbook, '組間差分.xlsx');
      } catch (error) {
        warning.value = {
          display: true,
          title: '錯誤',
          content: error.message,
          textInButton: '關閉',
        };
      }
    }

    return {
      sheets,
      setting,
      warning,
      complete,
      download,
      rawFile,
      upload,
      studentInfoKeys,
    };
  },
};
</script>
