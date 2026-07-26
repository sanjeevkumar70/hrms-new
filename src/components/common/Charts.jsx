import React from 'react'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts'
import { cx } from '@/utils'

const tooltipStyle = {
  background: 'rgba(15,23,42,0.95)',
  color: '#fff',
  borderRadius: 10,
  border: 'none',
  fontSize: 12,
  padding: '8px 12px',
  boxShadow: '0 8px 30px rgba(15,23,42,0.3)',
}

const ChartCard = ({ title, subtitle, actions, children, className }) => (
  <div className={cx('card chart-card', className)}>
    <div className="card-header">
      <div>
        <h3>{title}</h3>
        {subtitle && <small className="text-muted">{subtitle}</small>}
      </div>
      <div>{actions}</div>
    </div>
    <div className="card-body" style={{ minHeight: 280 }}>
      {children}
    </div>
  </div>
)

const grid = { stroke: '#e2e8f0', strokeDasharray: '3 3' }
const axis = { stroke: '#94a3b8', fontSize: 11 }

export const AttendanceBarChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={280}>
    <BarChart data={data} barSize={16}>
      <CartesianGrid {...grid} />
      <XAxis dataKey="date" {...axis} />
      <YAxis {...axis} />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
      <Bar dataKey="present" name="Present" radius={[8, 8, 0, 0]} stackId="a">
        {data.map((_, i) => <Cell key={i} fill="#10b981" />)}
      </Bar>
      <Bar dataKey="wfh" name="WFH" radius={[8, 8, 0, 0]} stackId="a">
        {data.map((_, i) => <Cell key={i} fill="#0d9488" />)}
      </Bar>
      <Bar dataKey="absent" name="Absent" radius={[8, 8, 0, 0]}>
        {data.map((_, i) => <Cell key={i} fill="#f43f5e" />)}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
)

export const MonthlyLineChart = ({ data = [], series = [] }) => (
  <ResponsiveContainer width="100%" height={280}>
    <LineChart data={data} margin={{ top: 8 }}>
      <defs>
        {series.map((s, i) => (
          <linearGradient key={s.key} id={`g-${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={s.color} stopOpacity={0} />
          </linearGradient>
        ))}
      </defs>
      <CartesianGrid {...grid} />
      <XAxis dataKey="date" {...axis} />
      <YAxis {...axis} />
      <Tooltip contentStyle={tooltipStyle} />
      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
      {series.map((s) => (
        <Line
          key={s.key}
          type="monotone"
          dataKey={s.key}
          name={s.name}
          stroke={s.color}
          strokeWidth={2.5}
          dot={{ r: 3, strokeWidth: 2 }}
          activeDot={{ r: 5 }}
          fill={`url(#g-${series.indexOf(s)})`}
        />
      ))}
    </LineChart>
  </ResponsiveContainer>
)

export const LeaveDoughnutChart = ({ data = [] }) => {
  const pieData = data.map((d) => ({ name: d.name, value: d.used || d.value, color: d.color }))
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" verticalAlign="bottom" wrapperStyle={{ fontSize: 12 }} />
        <Pie
          data={pieData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          stroke="#fff"
          strokeWidth={3}
          animationDuration={900}
        >
          {pieData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}

export const EmployeeGrowthChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={280}>
    <AreaChart data={data} margin={{ top: 8 }}>
      <defs>
        <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" stopOpacity={0.5} />
          <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <CartesianGrid {...grid} />
      <XAxis dataKey="month" {...axis} />
      <YAxis {...axis} />
      <Tooltip contentStyle={tooltipStyle} />
      <Area
        type="monotone"
        dataKey="employees"
        name="Employees"
        stroke="#2563eb"
        strokeWidth={2.5}
        fill="url(#eg)"
        dot={{ r: 3 }}
        activeDot={{ r: 5 }}
      />
    </AreaChart>
  </ResponsiveContainer>
)

export default ChartCard
