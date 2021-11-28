<template>
  <div>
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
      <p class="title">成績是在哪個sheet?</p>
      <p class="note">目前只支援單格sheet的擺放方式。</p>
      <select v-model="setting.sheet" class="primary">
        <option v-for="(sheet, index) in sheets" :value="sheet" :key="index">
          {{ sheet }}
        </option>
      </select>
    </div>

    <div class="group">
      <p class="title">成績是怎麼放的？</p>
      <p class="note">目前只支援單行的擺放方式。</p>
      <select v-model="setting.wayOfPuttingScore" class="primary">
        <option value="singleLine">單行</option>
      </select>
    </div>

    <div class="group" v-if="setting.sheet">
      <p class="title">成績在哪一行？</p>
      <select v-model="setting.scoreKey" class="primary">
        <option v-for="(key, index) in keys" :value="key" :key="index">
          {{ key }}
        </option>
      </select>
    </div>

    <div class="group">
      <p class="title">輸出的欄位名稱</p>
      <select v-model="setting.outputKey" class="primary">
        <option v-for="(key, index) in keys" :value="key" :key="index">
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
      <p class="title">
        請定義級距，四個級距中，只需要定義第二級距和第三級距即可。
      </p>
      <p class="note">
        ex: 第一級距: 90~80，第二級距：70~80，第三級距：60~70，第四級距:
        60以下，只需要定義第二級距和第三級距即可
      </p>
      <div class="same-line">
        <p class="title">第二級距：</p>
        <div class="same-line__element--input">
          <input
            v-model.number="setting.scoreClass.second.start"
            type="text"
            class="text"
            placeholder="開始(ex: 70)"
          />
        </div>
        <div style="same-line__element--input">
          <input
            v-model.number="setting.scoreClass.second.end"
            type="text"
            class="text"
            placeholder="結束(ex: 80)"
          />
        </div>
      </div>
      <div class="same-line">
        <p class="title">第三級距：</p>
        <div class="same-line__element--input">
          <input
            v-model.number="setting.scoreClass.third.start"
            type="text"
            class="text"
            placeholder="開始(ex: 60)"
          />
        </div>
        <div style="same-line__element--input">
          <input
            v-model.number="setting.scoreClass.third.end"
            type="text"
            class="text"
            placeholder="結束(ex: 70)"
          />
        </div>
      </div>
    </div>
    <fieldset class="mt-4">
      <button @click="$router.replace('/')" class="white">返回</button>
      <button @click="startChecking" class="purple">開始檢核！</button>
    </fieldset>
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
import check from './check';
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
    let excel = {};
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
      sheet: null,
      scoreKey: null,
      outputKey: null,
      checkingType: null,
      scoreGapThreshold: null,
      scoreClass: {
        second: {
          start: null,
          end: null,
        },
        third: {
          start: null,
          end: null,
        },
      },
    });
    const keys = computed(() => (excel && setting.sheet ? Object.keys(excel[setting.sheet][0]) : []));

    async function upload() {
      try {
        excel = await spiderman.excel.rawFileToObject(rawFile);
        sheets.value = Object.keys(excel);
      } catch (error) {
        warning.value = {
          display: true,
          title: '錯誤',
          content: error.message,
          textInButton: '關閉',
        };
      }
    }

    function startChecking() {
      // todo: 檢查檔案類別?
      // todo: 檢查title只有一行?
      // todo: multipleLine to singleLine
      try {
        switch (true) {
          case !excel:
            throw Error('您尚未上傳成績表格。');
          case !setting.wayOfPuttingScore:
            throw Error('請選擇成績擺放方式。');
          case !setting.scoreKey:
            throw Error('請選擇成績在哪一行。');
          case !setting.checkingType:
            throw Error('請選擇差分檢核機制。');
          default:
            break;
        }

        switch (setting.checkingType) {
          case 'scoreDiff': {
            const {
              scoreKey, outputKey, sheet, scoreGapThreshold,
            } = setting;
            const students = excel[sheet];

            if (!setting.scoreGapThreshold) throw Error('請填寫差分過大的門檻。');

            const invalidStudents = check.scoreDiff({
              students,
              scoreKey,
              scoreGapThreshold,
            });

            if (invalidStudents.length === 0) {
              complete.display = true;
              break;
            }

            let content = '以下同學不符合差分標準：\n';
            invalidStudents.forEach((invalidStudent) => {
              content += `${invalidStudent[outputKey]}\n`;
            });

            warning.value = {
              display: true,
              title: '差分檢核不通過',
              content,
              textInButton: '關閉',
            };
            break;
          }

          case 'classDiff': {
            const {
              scoreKey,
              sheet,
              scoreClass: { secondClass, thridClass },
            } = setting;
            const students = excel[sheet];

            if (!secondClass.start) throw Error('請填寫第二級距開始成績。');
            if (!secondClass.end) throw Error('請填寫第二級距結束成績。');
            if (!thridClass.start) throw Error('請填寫第三級距開始成績。');
            if (!thridClass.end) throw Error('請填寫第三級距結束成績。');
            if (secondClass.start >= secondClass.end) throw Error('第二級距結束成績需要大於開始成績。');
            if (thridClass.start >= thridClass.end) throw Error('第三級距結束成績需要大於開始成績。');

            check.classDiff({
              students,
              scoreKey,
              secondClass,
              thridClass,
            });
            break;
          }

          default:
            break;
        }
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
      keys,
      sheets,
      setting,
      startChecking,
      complete,
      warning,
    };
  },
};
</script>
