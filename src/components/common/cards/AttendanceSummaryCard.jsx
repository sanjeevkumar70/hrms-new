import { motion } from 'framer-motion'
import './cards.scss'

const AttendanceSummaryCard = ({
  data = [],
  title = '',
  period = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card p-0 cards-wrapper"
    >
      <div className="card-header d-flex justify-content-between align-items-center">
        <h3 className="mb-0">
          {title}
        </h3>

        <span className="small text-muted">
          {period}
        </span>
      </div>

      <div className="card-body">
        <div className="row g-3">
          {data.map((item) => {
            const value = Number(item.value) || 0
            const total = Number(item.total) || 0

            const percentage =
              total > 0
                ? Math.min((value / total) * 100, 100)
                : 0

            return (
              <div
                key={item.key || item.k}
                className="col-md-4 col-sm-6 col-lg-3 "
              >
                <div
                  className="card card-stat h-100"
                  style={{
                    padding: '1rem 1.25rem',
                  }}
                >
                  <div className="stat-label">
                    {item.label}
                  </div>

                  <div
                    className="stat-value"
                    style={{ fontSize: '1.5rem' }}
                  >
                    {item.value}
                  </div>

                  {item.info && (
                    <div className="stat-delta up">
                      {item.info}
                    </div>
                  )}

                  {item.total !== undefined && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <small className="text-muted">
                          Used
                        </small>

                        <small className="text-muted">
                          {item.value}/{item.total}
                        </small>
                      </div>

                      <div
                        className="progress"
                        style={{
                          height: '6px',
                          borderRadius: '10px',
                        }}
                      >
                        <div
                          className="progress-bar"
                          role="progressbar"
                          style={{
                            width: `${percentage}%`,
                            borderRadius: '10px',
                          }}
                          aria-valuenow={percentage}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        />
                      </div>

                      <small className="text-muted">
                        {Math.round(percentage)}%
                      </small>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

export default AttendanceSummaryCard