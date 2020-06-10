import React, { useCallback, useEffect, useState } from 'react'
import WithSemanticDataRequired from '../imports/with-semantic-data-required'

import * as AppDictionary from '../commons/Vocab'
import { onEnter as onEnterUtils } from '../commons/utils'
import WhenClickOutside from './WhenClickOutside'

// props: { todo, onDone, onDelete, onChange }
export default function TodoItem (props) {
  const [todo, setTodo] = useState(props.todo)
  const [isEditing, setEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState()

  useEffect(() => {
    setTodo(props.todo)
  }, [props.todo])

  useEffect(() => {
    props.todo.getOneValue(AppDictionary.TITLE).then(setEditedTitle)
  }, [props.todo])

  const onEnter = useCallback(
    event =>
      onEnterUtils(event, () => {
        if (editedTitle !== '') {
          onSave()
        }
      }),
    [editedTitle, setEditing]
  )

  const onSave = useCallback(() => {
    if (editedTitle !== '') {
      setEditing(false)
      props.onChange(editedTitle)
    }
  }, [editedTitle, setEditing])

  return (
    <WithSemanticDataRequired
      data={todo}
      mappings={{
        id: AppDictionary.TODO_ID,
        title: AppDictionary.TITLE,
        completed: AppDictionary.COMPLETED
      }}
    >
      {({ title, completed }) => (
        <li
          onDoubleClick={() => setEditing(true)}
          className={`${isEditing ? 'editing' : ''} ${
            completed ? 'completed' : ''
          }`}
        >
          <div className='view'>
            <input
              type='checkbox'
              className='toggle'
              checked={completed}
              onChange={event => props.onDone(event)}
              autoFocus={true}
            />
            <label>{title}</label>
            <button
              className='destroy'
              onClick={event => props.onDelete(event)}
            />
          </div>
          {isEditing && (
            <WhenClickOutside callback={onSave}>
              {/* TODO MODIFIER DANS LA VERSION NON EVOLVABLE-BY-DESIGN */}
              <input
                className='edit'
                value={editedTitle}
                onChange={event => setEditedTitle(event.target.value)}
                onKeyPress={onEnter}
              />
            </WhenClickOutside>
          )}
        </li>
      )}
    </WithSemanticDataRequired>
  )
}
