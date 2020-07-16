import React from 'react'
import { NavLink } from 'react-router-dom'
import WithSemanticDataRequired from '../imports/with-semantic-data-required'

import * as AppDictionary from '../commons/Vocab'
import TodoList from '../commons/TodoListPivo'
import TodoInput from './TodoInput'
import TodoItem from './TodoItem'

export default class TodoListComponent extends React.Component {
  state = { left: -1 }

  componentDidUpdate (prevProps) {
    if (this.props.todos !== prevProps.todos) {
      TodoList.countTodosLeft(this.props.todos).then(left =>
        this.setState({ ...this.state, left })
      )
    }
  }

  render () {
    const {
      todos,
      createTodo,
      deleteTodo,
      clearCompletedTodos,
      switchStatusOfAllTodos,
      updateTodoTitle,
      switchTodoCompletedStatus
    } = this.props

    const { left } = this.state
    const isAnyDone = left < todos.length
    const areAllDone = todos.length

    return (
      <React.Fragment>
        <header className='header'>
          <h1>todos</h1>
          <TodoInput onAddTodo={createTodo} />
        </header>

        <section className='main'>
          <input
            id='toggle-all'
            type='checkbox'
            className='toggle-all'
            checked={areAllDone}
            onChange={switchStatusOfAllTodos}
          />
          <label htmlFor='toggle-all' />
          <ul className='todo-list'>
            {todos.map((todo, index) => {
              return (
                <WithSemanticDataRequired
                  data={todo}
                  key={index}
                  mappings={{ id: AppDictionary.TODO_ID }}
                >
                  {({ id }) => (
                    <TodoItem
                      key={id}
                      todo={todo}
                      onChange={newTitle => updateTodoTitle(todo, newTitle)}
                      onDelete={() => deleteTodo(todo)}
                      onDone={() => switchTodoCompletedStatus(todo)}
                    />
                  )}
                </WithSemanticDataRequired>
              )
            })}
          </ul>
        </section>

        <footer className='footer'>
          <span className='todo-count'>
            <strong>{left}</strong> items left
          </span>
          <ul className='filters'>
            <li>
              <NavLink exact={true} to='/' activeClassName='selected'>
                All
              </NavLink>
            </li>
            <li>
              <NavLink to='/active' activeClassName='selected'>
                Active
              </NavLink>
            </li>
            <li>
              <NavLink to='/completed' activeClassName='selected'>
                Completed
              </NavLink>
            </li>
          </ul>
          {isAnyDone && (
            <button className='clear-completed' onClick={clearCompletedTodos}>
              Clear completed
            </button>
          )}
        </footer>
      </React.Fragment>
    )
  }
}
