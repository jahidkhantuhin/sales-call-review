import { Plugin } from '@nuxt/types'
import { createShowcaseApi } from '~/showcase/api'

const showcase: Plugin = ({ $axios, store }, inject) => {
  const api = createShowcaseApi()
  const state = { loggedIn: true, user: api.session() }
  store.registerModule('auth', { namespaced: true, state, mutations: {
    refresh(current) { current.user = api.session() },
  } })

  const refresh = async () => { store.commit('auth/refresh') }
  inject('auth', {
    get user() { return state.user },
    get loggedIn() { return state.loggedIn },
    hasScope: (scope: string) => state.user.scope.includes(scope),
    fetchUser: refresh,
    setUserToken: refresh,
    setUser: refresh,
    loginWith: async () => ({ data: { data: api.session() } }),
    logout: async () => {},
  })
  $axios.onRequest(config => {
    config.adapter = api.adapter as typeof config.adapter
    return config
  })
}

export default showcase
