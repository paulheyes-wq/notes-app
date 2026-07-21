# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Supabase Auth setup (Google sign-in)

Google sign-in is enabled via Supabase Auth. When deploying to a new environment or domain, redirect URL settings need updating or the OAuth flow will fail:

- **Supabase → Authentication → URL Configuration → Site URL**: must be the app's permanent production domain, e.g. `https://notes-app-nu-azure.vercel.app`. Do **not** point this at a per-deployment preview URL (the random hash Vercel generates for each build, e.g. `notes-xxxxxxxxx-<scope>.vercel.app`) — those URLs are frozen snapshots of whatever was deployed at the time, so signing in would silently redirect back to a stale build instead of the current one.
- **Supabase → Authentication → URL Configuration → Redirect URLs**: add every site URL the app is served from (e.g. `http://localhost:5173`, plus the permanent production domain above).
- **Google Cloud Console → OAuth client → Authorized redirect URIs**: must include the Supabase callback URL, `https://<project-ref>.supabase.co/auth/v1/callback`.
