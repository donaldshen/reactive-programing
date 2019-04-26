export interface State {
  [prop: string]: any
}
export interface Getters {
  [func: string]: ValFunc
}
export interface ValFunc {
  (state: State, getters: GettersReactive): any
}
export interface GettersReactive {
  [prop: string]: any
}
