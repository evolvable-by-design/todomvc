import React, { useState } from 'react'
import { BrowserRouter, Route } from 'react-router-dom'
import axios from 'axios'
import 'todomvc-app-css/index.css'

import './App.css'
import * as Config from './config'
import FooterImperative from './imperative/Footer'
import TodoListPageImperative from './imperative/TodoListPage'

import FooterFunctional from './functional/Footer'
import TodoListPageFunctional from './functional/TodoListPage'
import { useOnFirstRender } from './commons/utils'

export default function App () {
  const apiUrl = Config.restApi.url

  const [isApiUnreachable, setIsApiUnreachable] = useState(false)

  useOnFirstRender(() => {
    const f = async () => {
      try {
        await axios.get(apiUrl + '/todos')
      } catch (error) {
        console.error(error)
        setIsApiUnreachable(true)
      }
    }

    f()
  }, [])

  return (
    <ErrorBoundary>
      {isApiUnreachable ? (
        <ErrorBanner
          errorText={`Can not connect to the API server at ${apiUrl}, please
            verify that it is up and running and reload this page.`}
        />
      ) : null}
      {Config.featureToggle.app === 'imperative' ? (
        <ImperativeApp />
      ) : (
        <FunctionalApp />
      )}
    </ErrorBoundary>
  )
}

function ErrorBanner ({ errorClass, errorText }) {
  return (
    <div className='banner'>
      <div className='banner-content flex-container'>
        <div className='container'>
          <h3>Error {errorClass && `- ${errorClass}`}</h3>
          <p>{errorText}</p>
        </div>
      </div>
    </div>
  )
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

class ErrorBoundary extends React.Component {
  constructor (props) {
    super(props)
    this.state = { error: undefined }
  }

  static getDerivedStateFromError (error) {
    return { error }
  }

  render () {
    return (
      <>
        {this.state.error && (
          <ErrorBanner
            errorClass={typeof this.state.error}
            errorText={this.state.error.message}
          />
        )}
        {this.props.children}
      </>
    )
  }
}
