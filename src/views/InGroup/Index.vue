<template>
  <div>
    <div class="group">
      <Upload>
        <input
          id="file-upload"
          type="file"
          class="sr-only"
          ref="excel"
          @change="upload"
        />
      </Upload>
    </div>

    <div class="group">
      <p class="title">成績是怎麼放的？</p>
      <p class="note">目前只支援單行的擺放方式。</p>
      <select v-model="setting.wayOfPuttingGrade" class="primary">
        <option value="singleLine">單行</option>
      </select>
    </div>

    <div class="group">
      <p class="title">成績在哪一行？</p>
      <select v-model="setting.gradeKey" class="primary">
        <option
          v-for="(gradeKey, index) in gradeKeys"
          :value="gradeKey"
          :key="index"
        >
          {{ gradeKey }}
        </option>
      </select>
    </div>
    <div class="group">
      <p class="title">您的差分檢核機制是？</p>
      <p class="note">目前只支援兩種差分檢核方式。</p>
      <select v-model="setting.validateType" class="primary">
        <option value="scoreDiff">
          單一學生，分數差距大於＿分，即為差分過大。
        </option>
        <option value="classDiff">
          單一學生，分數差距大於兩個級距，即為差分過大。
        </option>
      </select>
    </div>
    <div v-if="setting.validateType === 'scoreDiff'" class="group">
      <p class="title">差幾分算是差分過大？</p>
      <input
        v-model.number="setting.gradeMaxGap"
        type="text"
        class="text"
        placeholder="20"
      />
    </div>
    <div v-if="setting.validateType === 'classDiff'" class="group">
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
            v-model.number="setting.gradeClass.second.start"
            type="text"
            class="text"
            placeholder="開始(ex: 70)"
          />
        </div>
        <div style="same-line__element--input">
          <input
            v-model.number="setting.gradeClass.second.end"
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
            v-model.number="setting.gradeClass.third.start"
            type="text"
            class="text"
            placeholder="開始(ex: 60)"
          />
        </div>
        <div style="same-line__element--input">
          <input
            v-model.number="setting.gradeClass.third.end"
            type="text"
            class="text"
            placeholder="結束(ex: 70)"
          />
        </div>
      </div>
    </div>
    <fieldset class="mt-4">
      <button @click="$router.replace('/')" class="white">返回</button>
      <button @click="validate" class="purple">開始檢核！</button>
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
import { reactive, ref } from 'vue';
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
    const excel = ref(null);
    const gradeKeys = ref(null);
    const complete = reactive({
      display: false,
      title: '檢核結束',
      content: '內容',
      textInButton: '下載',
    });
    const warning = reactive({
      display: false,
      title: '錯誤',
      content: '內容',
      textInButton: '了解',
    });
    const setting = reactive({
      wayOfPuttingGrade: null,
      gradeKey: null,
      validateType: null,
      gradeMaxGap: null,
      gradeClass: {
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
    let grades;

    async function upload() {
      grades = await spiderman.excel.rawExcelToJson(excel);
      gradeKeys.value = Object.keys(grades[0]);
      console.log(gradeKeys.value);
    }

    function validate() {
      // todo: 檢查檔案類別?
      // todo: 檢查title只有一行?
      // todo: multipleLine to singleLine
      try {
        switch (true) {
          case !grades:
            throw Error('您尚未上傳成績表格。');
          case !setting.wayOfPuttingGrade:
            throw Error('請選擇成績擺放方式。');
          case !setting.gradeKey:
            throw Error('請選擇成績在哪一行。');
          case !setting.validateType:
            throw Error('請選擇差分檢核機制。');
          default:
            break;
        }

        switch (setting.validateType) {
          case 'scoreDiff': {
            const { gradeKey, gradeMaxGap } = setting;

            if (!setting.gradeMaxGap) throw Error('請填寫差分過大的門檻。');

            check.scoreDiff({
              grades,
              gradeKey,
              gradeMaxGap,
            });
            break;
          }

          case 'classDiff':
            if (!setting.gradeClass.second.start) throw Error('請填寫第二級距開始成績。');
            if (!setting.gradeClass.second.end) throw Error('請填寫第二級距結束成績。');
            if (
              setting.gradeClass.second.start >= setting.gradeClass.second.end
            ) throw Error('第二級距結束成績需要大於開始成績。');
            if (!setting.gradeClass.third.start) throw Error('請填寫第三級距開始成績。');
            if (!setting.gradeClass.third.end) throw Error('請填寫第三級距結束成績。');
            if (setting.gradeClass.third.start >= setting.gradeClass.third.end) throw Error('第三級距結束成績需要大於開始成績。');

            check.classDiff(grades);
            break;

          default:
            break;
        }
      } catch (error) {
        warning.display = true;
        warning.content = error.message;
      }
    }

    return {
      excel,
      upload,
      gradeKeys,
      setting,
      validate,
      complete,
      warning,
    };
  },
};
</script>
