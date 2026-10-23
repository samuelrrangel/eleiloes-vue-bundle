import { createApp, reactive } from 'vue'

// Vue 3 não tem construtor `Vue` nem `Vue.util.defineReactive`.
// O app precisa resolver `vue` para `@vue/compat` (MODE 2) para os
// render functions, filtros e `.native` atuais continuarem válidos.

export function defineReactive (target, key, value) {
  if (target && target.__v_isReactive) {
    target[key] = value
    return
  }
  const state = reactive({ value })
  Object.defineProperty(target, key, {
    enumerable: true,
    configurable: true,
    get () {
      return state.value
    },
    set (next) {
      state.value = next
    }
  })
}

export function asVueApp (app) {
  if (!app.util) app.util = {}
  if (typeof app.util.defineReactive !== 'function') {
    app.util.defineReactive = defineReactive
  }
  if (!app.prototype && app.config && app.config.globalProperties) {
    app.prototype = app.config.globalProperties
  }
  return app
}

export function mountLegacy (definition, el) {
  const host = el || document.createElement('div')
  const app = createApp(definition)
  const vm = app.mount(host)
  vm.$destroy = () => {
    app.unmount()
    if (host.parentNode) host.parentNode.removeChild(host)
  }
  return vm
}
