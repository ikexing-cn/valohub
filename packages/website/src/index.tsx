/* @refresh reload */
import { render } from 'solid-js/web'

import 'uno.css'
import '@unocss/reset/tailwind.css'
import './assets/base.css'

import DailyStore from './routes/daily-store'

function AppRoot() {
  return (
    <Router>
      <Route path="/daily-store" component={DailyStore} />
    </Router>
  )
}

render(() => <AppRoot />, document.querySelector('#root')!)
