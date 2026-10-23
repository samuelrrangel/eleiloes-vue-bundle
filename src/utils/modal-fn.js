import { mountLegacy } from '../runtime.js'

export default function (Component, Vue) {
  return ({ className, ...props }, resolver) => {
    return new Promise((resolve, reject) => {
      const node = document.createElement('div')
      document.body.appendChild(node)

      const
        ok = data => {
          resolve(data)
          vm.$destroy()
        },
        cancel = reason => {
          reject(reason || new Error())
          vm.$destroy()
        }

      const vm = mountLegacy({
        data () {
          return { props }
        },
        render: h => h(Component, {
          ref: 'modal',
          props,
          'class': className,
          on: {
            ok,
            cancel
          }
        }),
        mounted () {
          this.$refs.modal.show()
        }
      }, node)

      resolver && resolver.then(ok, cancel)
    })
  }
}
