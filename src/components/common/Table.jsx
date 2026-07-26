import React from 'react'
import DataTable from 'react-data-table-component'
import { StyleSheetManager } from 'styled-components'
import isPropValid from '@emotion/is-prop-valid'
import { cx } from '@/utils'
import Loader from './Loader'
import EmptyState from './Loader'
import { FiSearch } from 'react-icons/fi'

const shouldForwardProp = (prop, target) => {
  if (typeof target === 'string') {
    if (prop.startsWith('$')) return false
    if (['minWidth', 'maxWidth', 'center', 'right', 'grow', 'allowOverflow'].includes(prop)) {
      return false
    }
    return isPropValid(prop)
  }
  return true
}

const customStyles = {
  headRow: { style: { borderBottom: '1px solid #e2e8f0' } },
  rows: { style: { minHeight: '52px' } },
  pagination: { style: { borderTopStyle: 'solid', borderTopWidth: '1px', borderTopColor: '#f1f5f9' } },
  table: { style: { borderRadius: 16, overflow: 'hidden' } },
}

const Table = ({
  columns,
  data,
  loading,
  progressPending,
  progressComponent = <Loader text="Fetching rows…" size={32} />,
  pagination = true,
  paginationPerPage = 10,
  paginationRowsPerPageOptions = [10, 25, 50, 100],
  selectableRows = false,
  expandableRows = false,
  noDataComponent = <EmptyState title="No records" description="Try adjusting filters." />,
  dense = false,
  striped = false,
  highlightOnHover = true,
  pointerOnHover = true,
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search…',
  actions,
  subHeaderComponent,
  header = true,
  className,
  ...rest
}) => {
  const showHeader = header && (!!title || !!actions || !!onSearchChange || !!subHeaderComponent)
  return (
    <div className={cx('card p-0 border-0 shadow-sm', className)}>
      {showHeader && (
        <div className="card-header">
          <div>
            {title && <h3>{title}</h3>}
          </div>
          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
            {!!onSearchChange && (
              <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  value={searchValue ?? ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="form-control"
                  style={{ minWidth: 220 }}
                />
              </div>
            )}
            {subHeaderComponent}
            {actions}
          </div>
        </div>
      )}
      <StyleSheetManager shouldForwardProp={shouldForwardProp}>
        <DataTable
          columns={columns}
          data={data}
          progressPending={progressPending ?? loading}
          progressComponent={progressComponent}
          noDataComponent={noDataComponent}
          pagination={pagination}
          paginationPerPage={paginationPerPage}
          paginationRowsPerPageOptions={paginationRowsPerPageOptions}
          selectableRows={selectableRows}
          expandableRows={expandableRows}
          dense={dense}
          striped={striped}
          highlightOnHover={highlightOnHover}
          pointerOnHover={pointerOnHover}
          customStyles={customStyles}
          {...rest}
        />
      </StyleSheetManager>
    </div>
  )
}

export default Table
