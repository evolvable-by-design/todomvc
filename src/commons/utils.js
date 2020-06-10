import { OpenApiUtils } from '@evolvable-by-design/pivo'
import { useEffect } from 'react'

export function guid () {
  var s4 = () => {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1)
  }

  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
}

export function onEnter (event, callback) {
  if (event.key === 'Enter') {
    event.preventDefault()
    callback(event)
  }
}

export function useOnFirstRender (fct) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fct, [])
}

export function promptToGetValueOfMissingParameters (operation, parameters) {
  if (operation && operation.missesRequiredParameters(parameters)) {
    const missingParameters = operation.getMissingParameters(parameters, false)
    const result = {}
    alert(
      'We need a few more information before we can execute: ' +
        operation.operationSchema.schema.summary
    )
    missingParameters.forEach(parameter => {
      const value = promptForValue(parameter)
      result[parameter.name] = value
    })
    return result
  } else {
    return {}
  }
}

function promptForValue (parameterSchema) {
  const { name, type, format, required } = parameterSchema
  const requiredMessage = required ? 'required' : 'optional'

  if (type === 'string') {
    return prompt(`Please enter a ${name} as a string (${requiredMessage})`)
  } else if (type === 'number') {
    const value = prompt(
      `Please enter a ${name} as a number (${requiredMessage})`
    )
    if (format && (format === 'float' || format === 'number')) {
      return parseFloat(value)
    } else {
      return parseInt(value, 10)
    }
  } else if (type === 'array') {
    const valuesType = parameterSchema.items.type
    const valuesFormat = parameterSchema.items.format

    const values = []
    do {
      values.push(
        promptForValue({ name, type: valuesType, format: valuesFormat })
      )
    } while (window.confirm(`Do you want to input more ${name}?`))
    return values.filter(el => el !== null && el !== undefined && el !== '')
  } else if (type === 'object') {
    alert(`Next, you will input values for ${name}`)
    const parameters = OpenApiUtils.schemaToParameters(parameterSchema, 'body')
    const values = parameters.reduce((acc, parameter) => {
      acc[parameter.name] = promptForValue(parameter)
      return acc
    }, {})
    alert(`Thank you, you have provided all values for ${name}`)
    return values
  } else {
    console.warn(
      `Unsupported type for parameter ${name}. Only string, number array and object are supported, received ${type}`
    )
    return null
  }
}
