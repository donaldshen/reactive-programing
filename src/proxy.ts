import { State, Getters, GettersReactive, ValFunc } from './types'

const isProxy = Symbol('proxy it is')
const isObject = (obj: any) => {
  return obj && typeof obj === 'object' && !obj[isProxy]
}

export default class Store {
  readonly state: State
  readonly getters: GettersReactive

  constructor({ state, getters = {} }: { state: State; getters: Getters }) {
    interface UpdateFunc {
      (): void
    }

    const stack: UpdateFunc[] = []

    const defineReactive = (obj: State) => {
      const dependents: {
        [prop: string]: Set<UpdateFunc>
      } = {}
      return new Proxy(obj, {
        get(target, prop: string | typeof isProxy) {
          console.log('get', prop)
          if (prop === isProxy) return true
          if (!(prop in dependents)) {
            dependents[prop] = new Set<UpdateFunc>()
          }
          if (stack.length) dependents[prop].add(stack[0])
          if (isObject(target[prop])) {
            target[prop] = defineReactive(target[prop])
          }
          return target[prop]
        },
        set(target, prop: string, val) {
          console.log('set', prop)
          target[prop] = val
          ;(dependents[prop] || []).forEach((updateFunc: UpdateFunc) =>
              updateFunc(),
            )
          if (isObject(val)) caches = {}
          return true
        },
      })
    }
    let caches: { [prop: string]: any } = {}
    const that = this
    const defineComputed = (getters: Getters) => {
      const dependents: {
        [prop: string]: Set<UpdateFunc>
      } = {}
      return new Proxy(
        {},
        {
          get(_, prop: string | typeof isProxy) {
            if (prop === isProxy) return true
            if (!(prop in dependents)) {
              dependents[prop] = new Set<UpdateFunc>()
            }
            if (stack.length) dependents[prop].add(stack[0])
            const valFunc = getters[prop]
            if (!(prop in caches)) {
              stack.unshift(() => {
                console.log('update', prop)
                const v = valFunc(that.state, that.getters)
                caches[prop] = v
                dependents[prop].forEach(
                  (updateFunc: UpdateFunc) => updateFunc(),
                )
              })
              caches[prop] = valFunc(that.state, that.getters)
              stack.shift()
            }
            return caches[prop]
          },
          set(_, prop: string, valFunc: ValFunc) {
            if (typeof valFunc !== 'function') throw new Error('getters 需要接受函数')
            getters[prop] = valFunc
            return true
          },
        },
      )
    }

    this.state = defineReactive(state)
    this.getters = defineComputed(getters)
  }
}
