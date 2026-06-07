# Frontend Documentation

## Axios Instance

הקובץ `src/api/axiosInstance.ts` יוצר מופע Axios מרכזי לשימוש בכל קריאות ה־API.

### למה זה חשוב?
- מגדיר כתובת בסיס אחת לכל הבקשות.
- מאפשר לשנות את כתובת ה־API במקום אחד בלבד.
- מאפשר להוסיף טיפול שגיאות ואינטרספטורים מרכזיים.

### כתובת ה־API
הכתובת נקבעת מקובץ `.env` בתיקיית `frontend`:

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

אם אין קובץ `.env` או אם המשתנה לא מוגדר, הקוד יפנה אוטומטית אל:

```text
http://localhost:4000/api
```

### שימוש ב־axiosInstance

בדוגמה הבאה אפשר לקרוא לנתיב `GET /health` מהשרת:

```ts
import axiosInstance from "./api/axiosInstance";

const response = await axiosInstance.get("/health");
console.log(response.data);
```

### מה צריך לבדוק
- האם ב־`frontend/.env` יש `VITE_API_BASE_URL`.
- האם השרת האחורי רץ על `http://localhost:4000`.
- האם הנתיב `/api` קיים בשרת האחורי.

## Redux Toolkit

בפרויקט הזה הוספנו Redux Toolkit כדי לנהל מצב גלובלי בצורה מסודרת.

### מה זה מאפשר?
- לשמור במרכז את המידע של המשתמש.
- לשלוח פעולות (`actions`) לשינוי המצב.
- לקרוא את המצב מכל קומפוננטה בלי להעביר props עמוקים.
- להשתמש בטיפוסים נכונים ב־TypeScript.

### קבצים חשובים

- `src/store/store.ts`
  - בונה את חנות ה־Redux (`store`).
  - מחבר reducers, כלומר את מה שמנהל כל חלק מהמצב.

- `src/store/userSlice.ts`
  - מגדיר `slice` בשם `user`.
  - כולל מצב התחלתי ומעבדים (`reducers`) ל־`setUser`, `clearUser`, `setLoading`, `setError`.

- `src/store/hooks.ts`
  - מייצר hooks מותאמים עבור React ו־TypeScript.
  - `useAppDispatch` ו־`useAppSelector` פשוטים ובטוחים.

- `src/main.tsx`
  - עוטף את היישום ב־`<Provider store={store}>`.
  - זה מאפשר לכל הקומפוננטות להשתמש ב־Redux.

### איך זה עובד ב־RegisterPage

בקומפוננטת ההרשמה, לאחר קריאת `POST /auth/register`:

```ts
dispatch(setUser({
  id: result.user.id,
  name: result.user.name,
  email: result.user.email,
}));
```

כך אנחנו שומרים את פרטי המשתמש ב־Redux.

באותו מקום משתמשים גם ב:
- `dispatch(setLoading())` כדי לסמן שהבקשה בטעינה.
- `dispatch(setError(message))` כדי לשמור שגיאות אם משהו נכשל.

## למה זה חשוב לפרויקט שלך

הגדרה זו מתאימה למבנה הנוכחי של הפרויקט, שבו יש:
- טופס הרשמה ב־React.
- קריאת API לשרת Node.js.
- צורך לשמור נתוני משתמש גלובליים.

### מה עוד אפשר להוסיף בהמשך
- `authSlice` עם מצב התחברות מלא.
- `surveySlice` לשמירת סקרים ושאלות.
- `responseSlice` לשמירת תשובות.

### מה לבדוק אחרי השינוי
- שהחבילות מותקנות: `@reduxjs/toolkit`, `react-redux`.
- ש־`main.tsx` כולל את `Provider`.
- ש־`RegisterPage.tsx` משתמש ב־`useAppDispatch` ו־`axiosInstance`.

## Redux Toolkit

בפרויקט זה השתמשנו ב־Redux Toolkit כדי לאחסן מידע של משתמש וסטטוס טעינה גלובלי.

### קבצים שנוצרו
- `src/store/store.ts` — יוצר את חנות ה־Redux (`store`) עם reducers.
- `src/store/userSlice.ts` — slice של `user`, כולל actions עבור:
  - `setUser`
  - `clearUser`
  - `setLoading`
  - `setError`
- `src/store/hooks.ts` — hooks מקודדים לטייפים `useAppDispatch` ו־`useAppSelector`.

### למה זה חשוב?
- מרכז מצב של משתמש במקום אחד
- מאפשר לכל הקומפוננטות לקבל גישה למידע בלי להעביר props ארוכים
- מתאים במיוחד לאותם חלקים של האפליקציה שעושים קריאות API ומשנים סטייט

### איך זה מחובר ליישום
ב־`src/main.tsx` עטפנו את היישום ב־`<Provider store={store}>` כדי שכל הקומפוננטות יוכלו להשתמש ב־Redux.

### דוגמה לשימוש ב־Redux ב־RegisterPage
כאשר משתמש נרשם בהצלחה, השרת מחזיר את פרטי המשתמש ו־Redux שומר אותם תחת `user`.

```ts
dispatch(setUser({
  id: result.user.id,
  name: result.user.name,
  email: result.user.email,
}));
```

### מה כדאי לבדוק
- שהחבילות מותקנות: `@reduxjs/toolkit`, `react-redux`
- ש־`src/main.tsx` כולל `Provider`
- ש־`src/pages/RegisterPage.tsx` משתמש ב־`useAppDispatch`

## Main Layout

בפרויקט זה הפיצלנו את ה־layout ל־קומפוננטות נפרדות:

- `src/components/Layout.tsx` — מקיים את שלד הדף והצורה הכללית.
- `src/components/Navbar.tsx` — מציג את התפריט העליון, קישורים ופרטי משתמש.
- `src/components/Footer.tsx` — מציג את הכותרת תחתונה שנמצאת בכל הדפים.

### למה זה טוב?
- חלוקה ברורה בין ליי-אוט לבין תוכן הניווט והכותרת התחתונה.
- ניתן לשנות את ה־Navbar או ה־Footer בלי לשנות את ה־Layout.
- ברור ומסודר יותר עבור פרויקט גדול עם תפקידים, auth ודפים רבים.

### איך זה מתחבר לפרויקט
- `AppRoutes` עוטף את כל ה־routes ב־`<Layout>`.
- `Layout` מייבא את ה־`Navbar` ואת ה־`Footer`.
- `Navbar` קורא את `user` מ־Redux כדי להציג שם משתמש לאחר הרשמה או התחברות.

### קבצים חשובים
- `src/components/Layout.tsx`
- `src/components/Navbar.tsx`
- `src/components/Footer.tsx`
- `src/index.css`

### עיצובים
- `Navbar` מקבל את הסגנון ב־`src/index.css` תחת `.navbar`, `.navbar__brand`, `.navbar__links`, `.navbar__user`.
- `Footer` מקבל את הסגנון תחת `.footer`.
