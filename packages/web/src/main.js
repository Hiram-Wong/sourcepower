import { createApp } from 'vue';
import 'tdesign-vue-next/es/style/index.css';
import '@/style/index.less';
import App from './App.vue';

import router from './router';
import { store } from './store';
import './permission';

const app = createApp(App);
app.use(store);
app.use(router);
app.mount('#app');
