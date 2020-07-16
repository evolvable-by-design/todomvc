import React, { useCallback, useEffect, useState } from 'react'
import WithSemanticDataRequired from '../imports/with-semantic-data-required'

import * as AppDictionary from '../commons/Vocab'
import { onEnter as onEnterUtils } from '../commons/utils'
import WhenClickOutside from './WhenClickOutside'

// props: { todo, onDone, onDelete, onChange }
export default function TodoItem (props) {
  const { onDone, onDelete, onChange } = props
  const [todo, setTodo] = useState(props.todo)
  const [isEditing, setEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState()

  useEffect(() => {
    setTodo(props.todo)
  }, [props.todo])

  useEffect(() => {
    props.todo.getOneValue(AppDictionary.TITLE).then(setEditedTitle)
  }, [props.todo])

  const onSave = useCallback(() => {
    if (editedTitle !== '') {
      setEditing(false)
      onChange(editedTitle)
    }
  }, [editedTitle, setEditing, onChange])

  const onEnter = useCallback(
    event =>
      onEnterUtils(event, () => {
        if (editedTitle !== '') {
          onSave()
        }
      }),
    [editedTitle, onSave]
  )

  return (
    <WithSemanticDataRequired
      data={todo}
      mappings={{
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
              onChange={event => onDone(event)}
              autoFocus={true}
            />
            <label>{title}</label>
            <button className='destroy' onClick={event => onDelete(event)} />
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
