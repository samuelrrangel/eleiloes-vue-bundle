import './polyfills'
import { asVueApp } from './runtime.js'
import { version } from '../package.json'
import Platform from './plugins/platform'
import History from './history.js'
import i18n from './i18n'
import Body from './body.js'
import menu from './app/menu'
import icon from '../icons/material-icons'

export const $uloc = {
  version,
  icon /* TODO: Alterar. Deve importar a configuração de ícones para os componentes com base no IconLibrary default */
}

export const queues = {
  server: [], // on SSR update
  takeover: [] // on client takeover
}

export default function (Vue, opts = {}) {
  if (this.installed) { return }
  this.installed = true

  asVueApp(Vue)
  const cfg = opts.config || {}

  // required plugins
  Platform.install($uloc, queues, Vue)
  Body.install($uloc, queues, cfg)
  History.install($uloc, cfg)
  i18n.install($uloc, queues, Vue, opts.i18n)
  menu.install({$uloc})

  opts.components && Object.keys(opts.components).forEach(key => {
    const c = opts.components[key]
    if (c.name !== undefined && (c.render !== void 0 || c.mixins !== void 0)) {
      Vue.component(c.name, c)
    }
  })

  opts.directives && Object.keys(opts.directives).forEach(key => {
    const d = opts.directives[key]
    if (d.name !== undefined && d.unbind !== void 0) {
      Vue.directive(d.name, d)
    }
  })

  if (opts.plugins) {
    const param = {$uloc, queues, Vue, cfg}
    Object.keys(opts.plugins).forEach(key => {
      const p = opts.plugins[key]
      if (typeof p.install === 'function' && p !== Platform) {
        p.install(param)
      }
    })
  }

  Vue.prototype.$uloc = $uloc
}
