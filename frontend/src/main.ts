// src/main.ts
import './assets/main.css'

import { createApp, h, provide } from 'vue'
import App from './App.vue'
import router from './router'

import { apolloClient } from './apollo'
import { DefaultApolloClient } from '@vue/apollo-composable'

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient)
  },
  render: () => h(App),
})

app.use(router)
app.mount('#app')
