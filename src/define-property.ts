import { State, Getters, GettersReactive } from './types'

export default class Store {
  readonly state: State
  readonly getters: GettersReactive

  constructor ({
    state,
    getters = {},
  }: {
    state: State
    getters: Getters
  }) {
    interface UpdateFunc { (): void }

    const stack: UpdateFunc[] = []

    const defineReactive = (obj: State) => {
      Object.entries(obj).forEach(([prop, val]) => {
        const dependents = new Set<UpdateFunc>()
        if (typeof val === 'object') {
          val = defineReactive(val)
        }
        Reflect.defineProperty(obj, prop, {
          enumerable: true,
          get () {
            if (stack.length) dependents.add(stack[0])
            return val
          },
          set (newVal) {
            if (Object.is(val, newVal)) return

            val = newVal
            dependents.forEach(updateFunc => updateFunc())

            if (typeof val === 'object') {
              val = defineReactive(val)
              caches = {}
            }
          },
        })
      })
      return obj
    }
    let caches: {[prop: string]: any} = {}
    const defineComputed = (getters: Getters) => {
      const gettersReactive = {}
      Object.entries(getters).forEach(([prop, valFunc]) => {
        const dependents = new Set<UpdateFunc>()
        Reflect.defineProperty(gettersReactive, prop, {
          enumerable: true,
          get () {
            if (stack.length) dependents.add(stack[0])
            // NOTE: dependents绑定会延迟到第一次求值的时候
            if (caches[prop] === undefined) {
              stack.unshift(() => {
                caches[prop] = valFunc(state, getters)
                dependents.forEach(updateFunc => updateFunc())
              })
              caches[prop] = valFunc(state, getters)
              stack.shift()
            }
            return caches[prop]
          },
        })
      })
      return gettersReactive
    }

    this.state = defineReactive(state)
    this.getters = defineComputed(getters)
  }
}
