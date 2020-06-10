import React from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import 'todomvc-app-css/index.css'

import * as Config from './config'
import FooterImperative from './imperative/Footer'
import TodoListPageImperative from './imperative/TodoListPage'

import FooterFunctional from './functional/Footer'
import TodoListPageFunctional from './functional/TodoListPage'

export default function App () {
  if (Config.featureToggle.app === 'imperative') {
    return <ImperativeApp />
  } else {
    return <FunctionalApp />
  }
}

function ImperativeApp () {
  return (
    <div className='app'>
      <div className='todoapp'>
        <BrowserRouter>
          <Route path='/:filter?' component={TodoListPageImperative} />
        </BrowserRouter>
      </div>

      <FooterImperative />
    </div>
  )
}

function FunctionalApp () {
  return (
    <div className='app'>
      <div className='todoapp'>
        <BrowserRouter>
          <Route path='/:filter?' component={TodoListPageFunctional} />
        </BrowserRouter>
      </div>

      <FooterFunctional />
    </div>
  )
}
