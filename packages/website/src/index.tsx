/* @refresh reload */
import { render } from 'solid-js/web'

import 'uno.css'
import './assets/base.css'

import '@unocss/reset/tailwind-compat.css'

import { Toaster } from 'solid-toast'
import DailyStore from './routes/daily-store'
import SignIn from './routes/bind'
import Verify from './routes/verify'

function AppRoot() {
  return (
    <>
      {/* 全局的 Toaster */}
      <Toaster position="top-center" />

      <Router>
        <Route path="/bind" component={SignIn} />
        <Route path="/verify" component={Verify} />
        <Route path="/daily-store" component={DailyStore} />
      </Router>
    </>
  )
}

render(() => <AppRoot />, document.querySelector('#root')!)
