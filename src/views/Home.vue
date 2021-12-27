<template>
  <div>
    <div class="group">
      <Alert
        title="資訊安全宣導"
        content="本系統僅讀取excel，並透過您的瀏覽器完成計算，沒有儲存任何資料，因此並無學生資訊洩漏疑慮，感謝。"
      />
    </div>
    <div class="group">
      <p class="title"><span class="text-red-500">組內</span>差分檢核</p>
      <p class="note">
        如果有不明白的地方，可以參考<a
          class="text-blue-900"
          href="https://www.youtube.com/watch?v=UL38oR1aUVQ&feature=youtu.be"
          target="_blank"
          >組內差分檢核示範影片</a
        >，謝謝。
      </p>
      <button @click="$router.push('in-group')" class="purple">前往</button>
    </div>

    <div class="group">
      <p class="title"><span class="text-red-500">組間</span>差分檢核</p>
      <p class="note">
        如果有不明白的地方，可以參考<a
          class="text-blue-900"
          href="https://www.youtube.com/watch?v=8fA-ZFlAYPE"
          target="_blank"
          >組間差分檢核示範影片</a
        >，謝謝。
      </p>
      <button @click="$router.push('between-groups')" class="purple">
        前往
      </button>
    </div>
  </div>
</template>
