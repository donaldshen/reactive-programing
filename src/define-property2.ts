import { State, GettersReactive, Getters, ValFunc } from './types'

export default class Store {
  readonly state: State
  readonly getters: GettersReactive

  constructor({ state, getters }: { state: State; getters: Getters }) {
    this.state = state
    this.getters = getters
    interface UpdateFunc {
      (): void
    }

    let updating: any
    const defineReactive = (obj: State, prop: string, val: any) => {
      const dependents: UpdateFunc[] = []
      Object.defineProperty(obj, prop, {
        get() {
          if (updating) dependents.push(updating)
          return val
        },
        set(valNew: any) {
          if (Object.is(val, valNew)) return
          val = valNew
          dependents.forEach(update => update())
        }
      })
    }

    const defineComputed = (obj: GettersReactive, prop: string, valFunc: ValFunc) => {
      let cache: any
      Object.defineProperty(obj, prop, {
        get() {
          if (typeof cache === 'undefined') {
            updating = () => {
              cache = valFunc(state, getters)
            }
            cache = valFunc(state, getters)
            updating = undefined
          }
          return cache
        }
      })
    }

    Object.entries(state).forEach(([k, v]) => {
      defineReactive(state, k, v)
    })
    Object.entries(getters).forEach(([k, v]) => {
      defineComputed(getters, k, v)
    })
  }
}
