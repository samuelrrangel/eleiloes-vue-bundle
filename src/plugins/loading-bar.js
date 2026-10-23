import { isSSR } from './platform.js'
import UAjaxBar from '../components/ajax-bar/UAjaxBar.js'
import { mountLegacy } from '../runtime.js'

export default {
  start () {},
  stop () {},
  increment () {},

  install ({ $uloc, Vue, cfg }) {
    if (isSSR) {
      $uloc.loadingBar = this
      return
    }

    const vm = mountLegacy({
      render: h => h(UAjaxBar, {
        ref: 'bar',
        props: cfg.loadingBar
      })
    })
    const bar = $uloc.loadingBar = vm.$refs.bar

    Object.assign(this, {
      start: bar.start,
      stop: bar.stop,
      increment: bar.increment
    })

    document.body.appendChild(vm.$el)
  }
}
