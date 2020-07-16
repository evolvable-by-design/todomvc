import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import * as Config from '../config'
import TodoList from './TodoList'
import TodoService from '../commons/TodoService'

export default function TodoListPageInit () {
  const [todoService, setTodoService] = useState()

  useEffect(() => {
    TodoService.forApiAtUrl(Config.restApi.url).then(setTodoService)
  }, [])

  if (todoService) {
    return <TodoListPage todoService={todoService} />
  } else {
    return <p>Loading...</p>
  }
}

function TodoListPage ({ todoService }) {
  const [todos, setTodos] = useState(todoService.getTodos())
  const { filter } = useParams()

  useEffect(() => {
    todoService.fetch(filter).then(setTodos)
  }, [filter, todoService])

  const createTodo = title =>
    todoService.add(title).then(({ allTodos }) => setTodos(allTodos))
  const deleteTodo = todo => todoService.delete(todo).then(setTodos)
  const clearCompletedTodos = () =>
    todoService.deleteMany('completed').then(setTodos)
  const switchStatusOfAllTodos = () =>
    todoService.switchStatusOfAllTodos().then(setTodos)
  const updateTodoTitle = (todo, newTitle) => {
    todoService.updateTodoTitle(todo, newTitle).then(setTodos)
  }
  const switchTodoCompletedStatus = todo =>
    todoService.switchTodoCompletedStatus(todo).then(setTodos)

  return (
    <TodoList
      todos={todos}
      createTodo={createTodo}
      deleteTodo={deleteTodo}
      clearCompletedTodos={clearCompletedTodos}
      switchStatusOfAllTodos={switchStatusOfAllTodos}
      updateTodoTitle={updateTodoTitle}
      switchTodoCompletedStatus={switchTodoCompletedStatus}
    />
  )
}
