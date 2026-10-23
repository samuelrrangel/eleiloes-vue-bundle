import { isSSR } from './platform.js'
import { defineReactive } from '../runtime.js'

export default {
  appVisible: false,

  install ({ $uloc, Vue }) {
    if (isSSR) {
      this.appVisible = $uloc.appVisible = true
      return
    }

    let prop, evt

    if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
      prop = 'hidden'
      evt = 'visibilitychange'
    }
    else if (typeof document.msHidden !== 'undefined') {
      prop = 'msHidden'
      evt = 'msvisibilitychange'
    }
    else if (typeof document.webkitHidden !== 'undefined') {
      prop = 'webkitHidden'
      evt = 'webkitvisibilitychange'
    }

    const update = () => {
      this.appVisible = $uloc.appVisible = !document[prop]
    }

    update()

    if (evt && typeof document[prop] !== 'undefined') {
      defineReactive($uloc, 'appVisible', this.appVisible)
      document.addEventListener(evt, update, false)
    }
  }
}
