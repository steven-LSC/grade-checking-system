<template>
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
    <p class="title">成績是怎麼放的？</p>
    <select v-model="setting.wayOfPuttingScore" class="primary">
      <option value="singleSheet">單個表格</option>
      <option value="multipleSheets">多個表格</option>
    </select>
  </div>

  <div v-if="setting.wayOfPuttingScore === 'singleSheet'" class="group">
    <p class="title">成績在哪一個表格？</p>
    <p class="note">選擇您將成績所放置的欄位</p>
    <select v-model="setting.sheetKey" class="primary">
      <option v-for="(sheet, index) in sheets" :value="sheet" :key="index">
        {{ sheet }}
      </option>
    </select>
  </div>

  <div v-if="setting.wayOfPuttingScore === 'multipleSheets'" class="group">
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
    <p class="note">例如：選擇學生姓名，審核結束時會輸出不合格的學生姓名。</p>
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
    <p class="title">您的差分檢核機制是？</p>
    <p class="note">目前只支援兩種差分檢核方式。</p>
    <select v-model="setting.checkingType" class="primary">
      <option value="scoreDiff">
        單一學生，分數差距大於＿分，即為差分過大。
      </option>
      <option value="classDiff">
        單一學生，分數差距大於兩個級距，即為差分過大。
      </option>
    </select>
  </div>
  <div v-if="setting.checkingType === 'scoreDiff'" class="group">
    <p class="title">差幾分算是差分過大？</p>
    <input
      v-model.number="setting.scoreGapThreshold"
      type="text"
      class="text"
      placeholder="20"
    />
  </div>

  <div v-if="setting.checkingType === 'classDiff'" class="group">
    <p class="title">請定義4個級距</p>
    <p class="note">
      ex: 第1級距: 80~100，第2級距: 70~80，第3級距: 60~70，第4級距: 0~60
    </p>
    <div v-for="(number, index) in 4" :key="index" class="same-line">
      <p class="title">第{{ number }}級距: &nbsp;</p>
      <div class="same-line__element--input">
        <input
          v-model.number="setting.scoreClasses[index].start"
          type="text"
          class="text"
          placeholder="開始"
        />
      </div>
      <div style="same-line__element--input">
        <input
          v-model.number="setting.scoreClasses[index].end"
          type="text"
          class="text"
          placeholder="結束"
        />
      </div>
    </div>
  </div>

  <div class="group">
    <button @click="$router.replace('/')" class="white">返回</button>
    <button @click="startChecking" class="purple">開始檢核！</button>
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
import { computed, reactive, ref } from 'vue';
import spiderman from '@/spiderman';
import transformScores from './libs/transform-scores';
import check from './libs/check';
import ModalComplete from '@/components/ModalComplete.vue';
import ModalWarning from '@/components/ModalWarning.vue';
import Upload from '@/components/Upload.vue';

export default {
  components: {
    ModalComplete,
    ModalWarning,
    Upload,
  },
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
      wayOfPuttingScore: null,
      sheetKey: null, // for singleSheet
      numSheetsPerStudent: null, // for multipleSheets
      scoreKey: null, // for both types
      outputKeys: [],
      checkingType: null,
      scoreGapThreshold: null, // for scoreDiff
      scoreClasses: [{}, {}, {}, {}], // for classDiff
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

    function handleInvalidStudents(invalidStudents) {
      console.log(invalidStudents);
      if (invalidStudents.length === 0) {
        complete.display = true;
        return;
      }

      const { outputKeys } = setting;

      let content = '以下同學不符合差分標準：\n';
      invalidStudents.forEach((invalidStudent) => {
        outputKeys.forEach((outputKey) => {
          if (outputKey) {
            content += `${invalidStudent[outputKey]} `;
          }
        });
        content += '\n';
      });

      warning.value = {
        display: true,
        title: '差分檢核不通過',
        content,
        textInButton: '關閉',
      };
    }

    function startChecking() {
      try {
        const {
          wayOfPuttingScore,
          checkingType,
          sheetKey,
          scoreKey,
          numSheetsPerStudent,
          scoreGapThreshold,
          scoreClasses,
        } = setting;

        if (!wayOfPuttingScore) throw Error('請選擇成績擺放方式。');
        if (!checkingType) throw Error('請選擇差分檢核機制。');

        // 先把成績轉換到統一格式
        const wayOfPuttingScoreSwitch = {
          singleSheet: () => transformScores.singleSheet({
            excel,
            sheetKey,
            scoreKey,
          }),
          multipleSheets: () => transformScores.multipleSheets({
            excel,
            numSheetsPerStudent,
            scoreKey,
          }),
        };
        const students = wayOfPuttingScoreSwitch[wayOfPuttingScore]();

        // 開始檢查
        const checkingTypeSwitch = {
          scoreDiff: () => check.scoreDiff({
            students,
            scoreGapThreshold,
          }),
          classDiff: () => check.classDiff({
            students,
            scoreClasses,
          }),
        };
        const invalidStudents = checkingTypeSwitch[checkingType]();

        // 顯示結果
        handleInvalidStudents(invalidStudents);
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
      rawFile,
      upload,
      studentInfoKeys,
      sheets,
      setting,
      startChecking,
      complete,
      warning,
    };
  },
};
</script>
