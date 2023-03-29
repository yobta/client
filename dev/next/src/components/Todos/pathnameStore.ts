import { createStore, storeEffect } from '@yobta/stores'
import { createHookFromStore } from '@yobta/stores/react'
import Router from 'next/router'

export const pathnameStore = createStore('')

storeEffect(pathnameStore, () => {
  pathnameStore.next(Router.pathname)
  Router.events.on('routeChangeStart', pathnameStore.next)
  return () => {
    Router.events.off('routeChangeStart', pathnameStore.next)
  }
})

export const usePathnameStore = createHookFromStore(pathnameStore)
