import axios from 'axios'
import Pivo from '@evolvable-by-design/pivo'

import * as AppDictionary from './Vocab'

export default class TodoServicePivo {
  constructor (documentation) {
    this.todos = {}
    this.todoListResource = undefined

    this.pivo = new Pivo(documentation)

    this.fetchOperation = this.pivo
      .get(AppDictionary.TODO_COLLECTION)
      .getOrThrow(() => new Error('REST API operation not available'))
  }

  static async forApiAtUrl (url) {
    const response = await axios.options(url)

    if (response.status === 200) {
      return new TodoServicePivo(response.data)
    } else {
      const errorMessage = `Impossible to get the documentation of the API at ${url}. This application is very likely not to work properly then. Try to refresh the page. If you don't see this message again, it means that things went right.`
      alert(errorMessage)
      throw new Error(errorMessage)
    }
  }

  getTodos () {
    return Object.values(this.todos)
  }

  async fetch (filter) {
    const parameters =
      filter !== undefined ? { [AppDictionary.STATUS]: filter } : {}
    const response = await this.fetchOperation.invoke(parameters)
    this.todoListResource = response.data
    const todos = await this.todoListResource.getArray(AppDictionary.TODOS)
    return this._updateTodosState(todos)
  }

  async add (title) {
    const operation = this.todoListResource
      .getRelation(AppDictionary.relations.CREATE, 1)
      .map(relation => relation.operation)
      .getOrThrow(
        () =>
          new Error(
            'The REST API operation to create a new todo is not available'
          )
      )

    const response = await operation.invoke({
      [AppDictionary.TITLE]: title
    })

    const todo = response.data
    const newTodosState = [].concat(Object.values(this.todos)).concat([todo])
    this._updateTodosState(newTodosState)

    return {
      allTodos: newTodosState,
      createdTodo: todo
    }
  }

  // newValues must be in the form of : { [semanticKey: string]: value }
  async updateTodo (todo, newValues) {
    const operation = todo
      .getRelation(AppDictionary.relations.UPDATE, 1)
      .map(relation => relation.operation)
      .getOrThrow(() => new Error('REST API operation not available'))

    const response = await operation.invoke({ ...todo.data, ...newValues })
    const newTodoValue = response.data

    return this._updateTodoInState(newTodoValue)
  }

  async updateTodoTitle (todo, newTitle) {
    return this.updateTodo(todo, { [AppDictionary.TITLE]: newTitle })
  }

  async delete (todo) {
    const operation = todo
      .getRelation(AppDictionary.relations.DELETE, 1)
      .map(relation => relation.operation)
      .getOrThrow(
        () =>
          new Error('The REST API operation to delete a todo is not available')
      )

    await operation.invoke()
    return this._deleteTodoInState(todo)
  }

  // status must be 'all' or 'completed' or 'active'
  async deleteMany (status) {
    const operation = this.todoListResource
      .getRelation(AppDictionary.relations.DELETE_MANY, 1)
      .map(relation => relation.operation)
      .getOrThrow(
        () =>
          new Error(
            'The REST API operation to delete many todos is not available'
          )
      )

    await operation.invoke({ [AppDictionary.STATUS]: status })

    return await this.fetch()
  }

  async switchTodoCompletedStatus (todo) {
    const isCompleted = await todo.getOneValue(AppDictionary.COMPLETED)

    const newValue = {
      [AppDictionary.COMPLETED]: !isCompleted,
      ...todo.data
    }

    return await this.updateTodo(todo, newValue)
  }

  async switchStatusOfAllTodos () {
    const allTodosWithStatus = await Promise.all(
      Object.values(this.todos).map(todo =>
        todo.getOneValue(AppDictionary.COMPLETED).then(completedStatus => {
          return { todo, completedStatus }
        })
      )
    )

    const areAllCompleted = allTodosWithStatus.every(
      ({ completedStatus }) => completedStatus === true
    )

    const shouldComplete = !areAllCompleted

    const todosToUpdate = allTodosWithStatus
      .filter(({ completedStatus }) => completedStatus !== shouldComplete)
      .map(({ todo }) => todo)

    await Promise.all(
      todosToUpdate.map(todo =>
        this.updateTodo(todo, { [AppDictionary.COMPLETED]: shouldComplete })
      )
    )

    return this.getTodos()
  }

  async _deleteTodoInState (todo) {
    const id = await todo.getOneValue('@id')
    const stateCopy = Object.assign({}, this.todos)
    delete stateCopy[id]
    return this._updateTodosState(stateCopy)
  }

  async _updateTodoInState (todo) {
    const id = await todo.getOneValue('@id')
    const stateCopy = Object.assign({}, this.todos)
    stateCopy[id] = todo
    return this._updateTodosState(stateCopy)
  }

  async _updateTodosState (newTodosState) {
    if (newTodosState instanceof Array) {
      const idsWithTodo = await Promise.all(
        newTodosState.map(todo =>
          todo.getOneValue('@id').then(id => {
            return { id, todo }
          })
        )
      )

      const todos = idsWithTodo.reduce((acc, el) => {
        acc[el.id] = el.todo
        return acc
      }, {})

      this.todos = todos
    } else {
      this.todos = newTodosState
    }

    return this.getTodos()
  }
}
