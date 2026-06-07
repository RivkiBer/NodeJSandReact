import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/**
 * hooks.ts
 *
 * כאן מגדירים hooks מותאמים כדי להשתמש ב־Redux באופן בטוח ב־TypeScript.
 * שימוש ב־hooks אלו עדיף על שימוש ב־useDispatch ו־useSelector רגילים.
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
