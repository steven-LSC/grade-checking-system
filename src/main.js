import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './assets/tailwind.css';
import * as globalComponents from './components/index';

const app = createApp(App);

Object.entries(globalComponents).forEach(([key, value]) => {
  app.component(key, value);
});

app.use(router).mount('#app');
