<template>
  <div>
    <fieldset>
      <div>
        <legend class="text-base font-medium text-gray-900">很抱歉，尚未提供此功能。</legend>
        <p class="text-sm text-gray-500">我們會盡快提供，敬請期待！</p>
      </div>
    </fieldset>
    <button
      @click="$router.push('/')"
      type="submit"
      class="
        mr-3
        inline-flex
        justify-center
        py-2
        px-4
        border border-transparent
        shadow-sm
        text-sm
        font-medium
        rounded-md
        text-white
        bg-indigo-600
        hover:bg-indigo-700
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
      "
    >
      返回
    </button>
  </div>
</template>
