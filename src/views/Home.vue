<template>
  <div>
    <div class="group">
      <p class="title"><span class="text-red-500">組內</span>差分檢核</p>
      <p class="note">
        在開始檢核前，如果有不明白的地方，請詳閱說明文件，謝謝。
      </p>
      <button @click="$router.push('in-group')" class="purple">前往</button>
    </div>
    <div class="group">
      <p class="title"><span class="text-red-500">組間</span>差分檢核</p>
      <p class="note">
        在開始檢核前，如果有不明白的地方，請詳閱說明文件，謝謝。
      </p>
      <button @click="$router.push('between-groups')" class="purple">
        前往
      </button>
    </div>
  </div>
</template>
