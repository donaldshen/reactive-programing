import Store from './define-property2'
import Store2 from './proxy'
import { State, Getters } from './types'
const options: {
  state: State
  getters: Getters
} = {
  state: {
    s1: 1,
    s2: {
      s21: 2,
    },
  },
  getters: {
    g1({ s1 }) {
      return s1 + 1
    },
    g2({ s1 }, { g1 }) {
      return s1 + g1
    },
    g3({ s2: { s21 } }) {
      return s21 + 1
    },
  },
}
// @ts-ignore
window.a = new Store(options)
// @ts-ignore
window.b = new Store2(options)
