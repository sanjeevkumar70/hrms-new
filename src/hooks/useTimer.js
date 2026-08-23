import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTodayAttendance, setTodayWorkingMinutes } from '@/redux/slices/attendanceSlice'
import { diffMinutes } from '@/utils'

export const useTimer = (enabled) => {
  const dispatch = useDispatch()
  const today = useSelector((s) => s.attendance.today)

  useEffect(() => {
    if (enabled) dispatch(fetchTodayAttendance())
  }, [enabled, dispatch])

  useEffect(() => {
    if (!enabled || !today?.punchIn || today.punchOut) return
    const id = setInterval(() => {
      const m = diffMinutes(today.punchIn, new Date().toISOString())
      dispatch(setTodayWorkingMinutes(m))
    }, 1000 * 30)
    return () => clearInterval(id)
  }, [today, dispatch, enabled])
}
