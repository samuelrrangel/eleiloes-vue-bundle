import langEn from '../i18n/pt-br.js'
import { defineReactive } from './runtime.js'

export default {
  install ($uloc, queues, Vue, lang) {
    this.set = (lang = langEn) => {
      lang.set = this.set
      lang.getLocale = this.getLocale
      lang.rtl = lang.rtl || false

      const el = document.documentElement
      el.setAttribute('dir', lang.rtl ? 'rtl' : 'ltr')
      el.setAttribute('lang', lang.lang)

      if ($uloc.i18n) {
        $uloc.i18n = lang
      }
      else {
        defineReactive($uloc, 'i18n', lang)
      }

      this.name = lang.lang
      this.lang = lang
    }

    this.set(lang)
  },

  getLocale () {
    let val =
      navigator.language ||
      navigator.languages[0] ||
      navigator.browserLanguage ||
      navigator.userLanguage ||
      navigator.systemLanguage

    if (val) {
      return val.toLowerCase()
    }
  }
}
