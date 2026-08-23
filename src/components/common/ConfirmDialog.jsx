import React from 'react'
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap'
import { cx } from '@/utils'
import { FiAlertTriangle, FiInfo, FiXCircle } from 'react-icons/fi'

const ConfirmDialog = ({
  isOpen,
  toggle,
  title = 'Confirm',
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
  loading,
  icon,
}) => {
  const iconMap = {
    danger: FiXCircle,
    warning: FiAlertTriangle,
    info: FiInfo,
  }
  const Icon = icon || iconMap[variant] || FiInfo
  const confirmClass =
    variant === 'danger' ? 'btn-danger' : variant === 'warning' ? 'btn-warning' : 'btn-primary'
  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="sm">
      <ModalBody className="confirm-dialog py-5">
        <div className={cx('dialog-icon', variant)}><Icon /></div>
        <h4 className="dialog-title">{title}</h4>
        <p className="dialog-message">{message}</p>
        <div className="d-flex justify-content-center gap-3 mt-4">
          <button
            type="button"
            className="btn btn-light"
            disabled={loading}
            onClick={onCancel || toggle}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={cx('btn', confirmClass)}
            disabled={loading}
            onClick={() => {
              if (onConfirm) onConfirm()
            }}
          >
            {loading ? 'Processing…' : confirmText}
          </button>
        </div>
      </ModalBody>
    </Modal>
  )
}

export default ConfirmDialog
