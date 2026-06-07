/**
 * userSlice.ts
 *
 * Slice זה מנהל את המצב של המשתמש ב־Redux.
 * המצב כולל:
 * - נתוני המשתמש (שם, אימייל, מזהה)
 * - מצב טעינה
 * - שגיאות
 */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IUser {
  id: string;
  name: string;
  email: string;
}

interface UserState {
  user: IUser | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: UserState = {
  user: null,
  status: "idle",
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
      state.status = "idle";
      state.error = null;
    },
    clearUser(state) {
      state.user = null;
      state.status = "idle";
      state.error = null;
    },
    setLoading(state) {
      state.status = "loading";
      state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.status = "failed";
      state.error = action.payload;
    },
  },
});

export const { setUser, clearUser, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;
