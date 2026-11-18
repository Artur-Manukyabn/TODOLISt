# ToDo List

Full-stack task application with email/password authentication, MongoDB persistence, and a responsive React interface.

## Local development

1. Install dependencies:

```powershell
npm install
Copy-Item server/.env.example server/.env
```

2. Set `MONGODB_URI` and `SESSION_SECRET` in `server/.env`.

3. Start backend and frontend in separate terminals:

```powershell
npm run server
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to `http://localhost:5000`, so frontend and backend use the same browser origin in development.

## Testing from a phone

1. Find your computer LAN IP in PowerShell:

```powershell
ipconfig
```

2. Make sure the phone and computer are on the same Wi-Fi network.
3. Start Vite with:

```powershell
npm run dev -- --host 0.0.0.0
```

4. Open `http://<LAN_IP>:5173` on the phone, for example `http://192.168.1.42:5173`.
5. Set the backend `CLIENT_URL` to the frontend LAN origin if needed:

```env
CLIENT_URL=http://192.168.1.42:5173
```

Google OAuth is not used by this version; email/password authentication only requires the backend and frontend to be reachable.

## Production deployment

### Backend — Render

- Build command: `npm install`
- Start command: `node server/server.js`
- Root directory: repository root

Production environment:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://.../todolist
SESSION_SECRET=long-random-production-secret
CLIENT_URL=https://your-project.vercel.app
```

Production cookies use `secure: true` and `sameSite: 'none'` because frontend and backend use different HTTPS origins.

### Frontend — Vercel

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: repository root

Vercel environment variable:

```env
VITE_API_URL=https://your-backend.onrender.com
```

Redeploy Vercel after changing the variable.

## Verification checklist

- [ ] Phone is on the same Wi-Fi network as the computer.
- [ ] Phone opens `http://<LAN_IP>:5173`, not `localhost`.
- [ ] Reload restores the logged-in user through `/api/auth/me`.
- [ ] Task created on one device appears on another after reload.
- [ ] Browser Network panel shows the `todo.sid` cookie.
- [ ] Browser console has no CORS errors.
- [ ] MongoDB, not browser storage, contains todos.
