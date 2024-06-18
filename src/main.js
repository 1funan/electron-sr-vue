import { createApp } from 'vue'
import { router } from '../common/router'
import App from './App.vue'
import naive from 'naive-ui'
const app = createApp(App)
app.use(router)
app.use(naive)
app.mount('#app')