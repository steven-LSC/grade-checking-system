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
      <p class="title">成績是怎麼放的？</p>
      <select v-model="setting.wayOfPuttingScore" class="primary">
        <option value="singleSheet">單個表格</option>
        <option value="multipleSheets">多個表格</option>
      </select>
    </div>

    <div v-if="setting.wayOfPuttingScore === 'singleSheet'" class="group">
      <p class="title">成績在哪一個表格？</p>
      <p class="note">選擇您將成績所放置的欄位</p>
      <select v-model="setting.sheet" class="primary">
        <option v-for="(sheet, index) in sheets" :value="sheet" :key="index">
          {{ sheet }}
        </option>
      </select>
    </div>

    <div v-if="setting.wayOfPuttingScore === 'multipleSheets'" class="group">
      <p class="title">幾個表格決定一個學生的成績?</p>
      <p class="note">注意：成績需要按照順序擺放好。</p>
      <input
        v-model="setting.numSheets"
        type="text"
        class="text"
        placeholder="ex: 3"
      />
    </div>

    <div class="group">
      <p class="title">成績在哪一行？</p>
      <p class="note">選擇您將成績所放置的欄位</p>
      <select v-model="setting.scoreKey" class="primary">
        <option v-for="(key, index) in keys" :value="key" :key="index">
          {{ key }}
        </option>
      </select>
    </div>

    <div class="group">
      <p class="title">輸出的欄位名稱</p>
      <p class="note">例如：選擇學生姓名，審核結束時會輸出不合格的學生姓名。</p>
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
        ex: 第一級距: 80以上，第二級距：70~80，第三級距：60~70，第四級距:
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
      sheet: null,
      wayOfPuttingScore: null,
      numSheets: null,
      sheets: [],
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
    const keys = computed(() => (setting.sheet ? Object.keys(excel[setting.sheet][0]) : []));

    async function upload() {
      try {
        excel = await spiderman.excel.rawFileToObject(rawFile);
        sheets.value = Object.keys(excel);
        [setting.sheet] = Object.keys(excel);
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
      if (invalidStudents.length === 0) {
        complete.display = true;
        return;
      }

      const { outputKey } = setting;

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
            const { scoreKey, sheet, scoreGapThreshold } = setting;
            const students = excel[sheet];

            if (!setting.scoreGapThreshold) throw Error('請填寫差分過大的門檻。');

            const invalidStudents = check.scoreDiff({
              students,
              scoreKey,
              scoreGapThreshold,
            });

            handleInvalidStudents(invalidStudents);

            break;
          }

          case 'classDiff': {
            const {
              scoreKey,
              sheet,
              scoreClass: { second: secondClass, third: thirdClass },
            } = setting;
            const students = excel[sheet];

            if (!secondClass.start) throw Error('請填寫第二級距開始成績。');
            if (!secondClass.end) throw Error('請填寫第二級距結束成績。');
            if (!thirdClass.start) throw Error('請填寫第三級距開始成績。');
            if (!thirdClass.end) throw Error('請填寫第三級距結束成績。');
            if (secondClass.start >= secondClass.end) throw Error('第二級距結束成績需要大於開始成績。');
            if (thirdClass.start >= thirdClass.end) throw Error('第三級距結束成績需要大於開始成績。');

            const invalidStudents = check.classDiff({
              students,
              scoreKey,
              secondClass,
              thirdClass,
            });

            handleInvalidStudents(invalidStudents);

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
