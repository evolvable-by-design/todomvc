import React from 'react'

import WithSemanticDataRequired from '../imports/with-semantic-data-required'

import * as AppDictionary from '../commons/Vocab'
import { onEnter } from '../commons/utils'
import WhenClickOutside from './WhenClickOutside'

export default class TodoItem extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      editedTitle: '',
      isEditing: false
    }
  }

  componentDidMount () {
    this.getTodoTitle().then(title => this.setEditedTitle(title))
  }

  componentDidUpdate (prevProps) {
    if (prevProps.todo !== this.props.todo) {
      this.getTodoTitle().then(title => this.setEditedTitle(title))
    }
  }

  async getTodoTitle () {
    return await this.props.todo.getOneValue(AppDictionary.TITLE)
  }

  onEnter (event) {
    onEnter(event, () => {
      if (this.state.editedTitle !== '') {
        this.onSave()
      }
    })
  }

  onSave () {
    if (this.state.editedTitle !== '') {
      this.setEditing(false)
      this.props.onChange(this.state.editedTitle)
    }
  }

  setEditing (isEditing) {
    this.setState({ ...this.state, isEditing })
  }

  setEditedTitle (editedTitle) {
    this.setState({ ...this.state, editedTitle })
  }

  render () {
    const { editedTitle, isEditing } = this.state
    const { todo } = this.props

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
            onDoubleClick={() => this.setEditing(true)}
            className={`${isEditing ? 'editing' : ''} ${
              completed ? 'completed' : ''
            }`}
          >
            <div className='view'>
              <input
                type='checkbox'
                className='toggle'
                checked={completed}
                onChange={event => this.props.onDone(event)}
                autoFocus={true}
              />
              <label>{title}</label>
              <button
                className='destroy'
                onClick={event => this.props.onDelete(event)}
              />
            </div>
            {isEditing && (
              <WhenClickOutside callback={() => this.onSave()}>
                <input
                  className='edit'
                  value={editedTitle}
                  onChange={event => this.setEditedTitle(event.target.value)}
                  onKeyPress={event => this.onEnter(event)}
                />
              </WhenClickOutside>
            )}
          </li>
        )}
      </WithSemanticDataRequired>
    )
  }
}
