import UWindow from '../components/window/UWindow.js'
import UWindowContainer from '../components/window/UWindowContainer.js'
import uid from '../utils/uid.js'
import { mountLegacy } from '../runtime.js'

/* eslint no-unused-vars: off */
let plugin
const instances = []
const listeners = []

function createVM (Vue, Container, wid, config, slot) {
  return mountLegacy({
    provide: {
      container: Container
    },
    data () {
      return {
        wid: wid
      }
    },
    methods: {},
    render: h => h(UWindow, {
      ref: `window_${wid}`,
      props: {
        wid: wid,
        ...config
      }
    }, slot.isSimpleNode ? slot.default : [h(slot.default, {
      props: config.props || {}
    })]),
    mounted () {
      this.$refs[`window_${wid}`].show()
    }
  })
}

function init ({Vue}) {
  this.container = mountLegacy(UWindowContainer)
  document.body.appendChild(this.container.$el)
}

function windowPlugin (Component, Vue, Container) {
  return {
    /**
     * Create an new Window
     * @param config
     * @return Promise
     */
    'new' (config, slot) {
      config = config || {}
      return new Promise((resolve, reject) => {
        let content, reason
        let wid = config.wid ? config.wid : uid()
        if (typeof instances[wid] !== 'undefined') {
          if (instances[wid].pending) {
            let reason = new Error('Window is opening, wait...')
          }
          reject(reason || new Error(`Window *${wid}* already exists`))
          return
        }
        instances[wid] = {pending: true}
        if (typeof slot === 'function') {
          content = slot
        }
        else {
          content = () => new Promise((resolve, reject) => {
            resolve({'default': slot, 'isSimpleNode': typeof slot !== 'object'})
          })
        }
        content().then((c) => {
          const vm = createVM.call(this, Vue, Container, wid, config, c)
          Container.$el.appendChild(vm.$el)
          instances[wid] = vm
          listeners[wid] = {}
          resolve(wid)
        })
      })
    },

    /**
     * Get an window instance by wid
     * @param wid
     * @return UWindow
     */
    get (wid) {
      return instances[wid]
    },

    /**
     * Close an window by wid
     * @param wid
     * @return boolean
     */
    close (wid) {
      if (typeof instances[wid] === 'undefined') {
        throw new Error(`Window with WID ${wid} not found`)
      }
      let vm = instances[wid]
      vm.$destroy()
      if (typeof listeners[wid] !== 'undefined') {
        delete listeners[wid]
      }
      delete instances[wid]
    },

    /**
     * Add event listeners to window by wid
     * @param wid
     * @param events
     * @return wid
     */
    listen (wid, events) {
      if (!(events instanceof Object)) {
        throw new Error('**events** need a object.')
      }
      if (typeof listeners[wid] === 'undefined') {
        listeners[wid] = {}
      }
      Object.keys(events).map((event, index) => {
        if (typeof listeners[wid][event] === 'undefined') {
          listeners[wid][event] = []
        }
        listeners[wid][event].push(events[event])
      })
    },

    /**
     * Turn off an window event listener
     * @param wid
     * @param event
     * @param listener
     */
    turnOffListener (wid, event, listener) {
      if (typeof instances[wid] === 'undefined') {
        throw new Error(`Window with WID ${wid} not found`)
      }
      if (typeof listeners[wid][event] !== 'undefined' && listeners[wid][event] instanceof Array) {
        var _listeners = listeners[wid][event]
        for (var i = 0, len = _listeners.length; i < len; i++) {
          if (_listeners[i] === listener) {
            _listeners.splice(i, 1)
            break
          }
        }
      }
    },

    /**
     * Emit window events listeners by wid and event name
     * @param wid
     * @param event
     * @param data
     */
    emit (wid, event, data) {
      if (typeof instances[wid] === 'undefined') {
        throw new Error(`Fail to emit event ${event.type ? event.type : event}. Window with WID ${wid} not exits`)
      }

      if (typeof event === 'string') {
        event = {type: event, data: data}
      }

      if (!event.type) {
        throw new Error('Event object missing *type* property.')
      }

      if (typeof listeners[wid][event.type] !== 'undefined' && listeners[wid][event.type] instanceof Array) {
        var _listeners = listeners[wid][event.type]
        for (var i = 0, len = _listeners.length; i < len; i++) {
          _listeners[i](wid, event.data ? event.data : null)
        }
      }
      event.type === 'close' && this.close(wid)
    }
  }
}

export default {
  install ({$uloc, Vue}) {
    init.call(this, {Vue})
    this.create = $uloc.window = plugin = windowPlugin(UWindow, Vue, this.container)
  }
}
