import React from 'react'

import * as Config from '../config'
import TodoList from './TodoList'
import TodoService from '../commons/TodoService'

export default class TodoListPageInit extends React.Component {
  state = {
    todoService: undefined
  }

  componentDidMount () {
    TodoService.forApiAtUrl(Config.restApi.url).then(todoService =>
      this.setState({ todoService })
    )
  }

  render () {
    const { todoService } = this.state

    if (todoService !== undefined) {
      return <TodoListPage todoService={todoService} {...this.props} />
    } else {
      return <p>Loading...</p>
    }
  }
}

class TodoListPage extends React.Component {
  state = { todos: [] }

  componentDidMount () {
    this.props.todoService
      .fetch(this.getFilter())
      .then(todos => this.updateTodos(todos))
  }

  componentDidUpdate (prevProps) {
    if (this.getFilter() !== TodoListPage.getFilter(prevProps)) {
      this.props.todoService
        .fetch(this.getFilter())
        .then(todos => this.setState({ ...this.state, todos }))
    }
  }

  static getDerivedStateFromProps (props) {
    return {
      todos: props.todoService.getTodos()
    }
  }

  static getFilter (props) {
    return props.match.params.filter
  }

  getFilter () {
    return TodoListPage.getFilter(this.props)
  }

  async createTodo (title) {
    const { allTodos } = await this.props.todoService.add(title)
    this.updateTodos(allTodos)
  }

  async updateTodoTitle (todo, newTitle) {
    const todos = await this.props.todoService.updateTodoTitle(todo, newTitle)
    this.updateTodos(todos)
  }

  async switchTodoCompletedStatus (todo) {
    const todos = await this.props.todoService.switchTodoCompletedStatus(todo)
    this.updateTodos(todos)
  }

  async deleteTodo (todo) {
    const todos = await this.props.todoService.delete(todo)
    this.updateTodos(todos)
  }

  updateTodos (newTodos) {
    this.setState({ ...this.state, todos: newTodos })
  }

  async clearCompletedTodos () {
    const newTodos = await this.props.todoService.deleteMany('completed')
    this.updateTodos(newTodos)
  }

  async switchStatusOfAllTodos () {
    const todos = await this.props.todoService.switchStatusOfAllTodos()
    this.updateTodos(todos)
  }

  render () {
    return (
      <TodoList
        todos={this.state.todos}
        createTodo={title => this.createTodo(title)}
        deleteTodo={todo => this.deleteTodo(todo)}
        clearCompletedTodos={() => this.clearCompletedTodos()}
        switchStatusOfAllTodos={() => this.switchStatusOfAllTodos()}
        updateTodoTitle={(todo, newTitle) =>
          this.updateTodoTitle(todo, newTitle)
        }
        switchTodoCompletedStatus={todo => this.switchTodoCompletedStatus(todo)}
      />
    )
  }
}
