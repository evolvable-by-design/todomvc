import React from 'react'

export default function Warning ({ children }) {
  return (
    <div
      style={{
        color: 'white',
        backgroundColor: 'rgba(231, 119, 40, 0.7)',
        padding: '8px 16px',
        fontSize: '16px'
      }}
    >
      <p>{children}</p>
    </div>
  )
}
