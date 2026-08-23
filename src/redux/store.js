import { configureStore, combineReducers } from '@reduxjs/toolkit'
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import authReducer from './slices/authSlice'
import uiReducer from './slices/uiSlice'
import employeeReducer from './slices/employeeSlice'
import attendanceReducer from './slices/attendanceSlice'
import leaveReducer from './slices/leaveSlice'

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  employee: employeeReducer,
  attendance: attendanceReducer,
  leave: leaveReducer,
})

const persistConfig = {
  key: 'hrms:root',
  storage,
  whitelist: ['auth', 'ui'],
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
})

window.__REDUX_STORE__ = store

export const persistor = persistStore(store)
