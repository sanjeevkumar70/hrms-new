import React, { useState } from 'react'
import ConfirmDialog from './ConfirmDialog'

export const useConfirm = () => {
  const [state, setState] = useState({ isOpen: false, props: {} })
  const confirm = (props) => new Promise((resolve) => {
    setState({
      isOpen: true,
      props: {
        ...props,
        onConfirm: () => { setState({ isOpen: false, props: {} }); resolve(true) },
        onCancel: () => { setState({ isOpen: false, props: {} }); resolve(false) },
        toggle: () => { setState({ isOpen: false, props: {} }); resolve(false) },
      },
    })
  })
  const node = (
    <ConfirmDialog {...state.props} isOpen={state.isOpen} />
  )
  return [confirm, node]
}

export default useConfirm
