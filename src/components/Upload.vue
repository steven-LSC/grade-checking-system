<template>
  <div
    class="
      mt-1
      flex
      justify-center
      px-6
      pt-5
      pb-6
      border-2 border-gray-300 border-dashed
      rounded-md
    "
  >
    <div class="space-y-1 text-center">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <label
        for="file-upload"
        class="
          relative
          cursor-pointer
          bg-white
          rounded-md
          font-medium
          text-indigo-600
          hover:text-indigo-500
          focus-within:outline-none
          focus-within:ring-2
          focus-within:ring-offset-2
          focus-within:ring-indigo-500
        "
      >
        <span>上傳</span>
        <slot></slot>
      </label>
      <p class="text-xs text-gray-500">CSV, XLS, XLSX</p>
    </div>
  </div>
</template>
