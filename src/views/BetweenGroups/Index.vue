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
      <button @click="$router.replace('/')" class="white">返回</button>
      <button @click="startChecking" class="purple">開始檢核！</button>
    </div>
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
import { ref, reactive } from 'vue';
import xlsx from 'xlsx';
import spiderman from '@/spiderman';
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

    async function upload() {
      try {
        excel = await spiderman.excel.rawFileToObject(rawFile);
        console.log(excel);
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
      console.log(excel);
      xlsx.writeFile(
        {
          SheetNames: ['mySheet'],
          Sheets: {
            mySheet: excel,
          },
        },
        'out.xlsx',
      );
    }

    return {
      warning,
      complete,
      startChecking,
      rawFile,
      upload,
    };
  },
};
</script>
