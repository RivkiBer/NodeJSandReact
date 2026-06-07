import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";

/**
 * store.ts
 *
 * קובץ זה יוצר את חנות ה־Redux של היישום.
 * כאן מחברים את כל ה־reducers שמנהל כל slice.
 */
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
