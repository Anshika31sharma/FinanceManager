# Deploying Finance Manager

Use **Render** for the backend and **Vercel** for the frontend. Don’t deploy the whole repo as one app.

---

## 1. Backend on Render

1. Push your code to **GitHub** (if you haven’t already).

2. Go to [render.com](https://render.com) → **Dashboard** → **New** → **Web Service**.

3. Connect your GitHub repo (`financeManager`).

4. Configure the service:
   - **Name:** `finance-manager-api` (or any name)
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

5. **Environment variables** (Environment tab):
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your MongoDB Atlas connection string (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/finance-dashboard`)
   - `JWT_SECRET` = a long random string (e.g. from [randomkeygen](https://randomkeygen.com/))
   - `FRONTEND_URL` = leave empty for now; set after deploying the frontend (e.g. `https://your-app.vercel.app`)

6. Click **Create Web Service**. Wait for the first deploy.

7. Copy your backend URL, e.g. `https://finance-manager-api.onrender.com`. You’ll use it in the frontend.

**Optional:** If you added `render.yaml` at the repo root, you can use **New** → **Blueprint** and point to the same repo; Render will create the service from the file (you still set env vars in the dashboard).

---

## 2. Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New** → **Project**.

2. Import your GitHub repo (`financeManager`).

3. Configure the project:
   - **Root Directory:** `frontend` (or leave default and set it to `frontend`)
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment variables** (before first deploy):
   - **Name:** `VITE_API_URL`  
   - **Value:** your Render backend URL **without** `/api`, e.g. `https://finance-manager-api.onrender.com`

5. Deploy. Vercel will give you a URL like `https://finance-manager-xxx.vercel.app`.

6. **Important:** In Render, set the backend env var:
   - `FRONTEND_URL` = your Vercel URL, e.g. `https://finance-manager-xxx.vercel.app`  
   So CORS allows your frontend. Then redeploy the backend on Render if needed.

---

## 3. MongoDB

Use **MongoDB Atlas** (free tier):

1. [cloud.mongodb.com](https://cloud.mongodb.com) → create a cluster.
2. **Database Access** → Add user (username + password).
3. **Network Access** → Add IP: `0.0.0.0/0` (allow from anywhere, required for Render).
4. **Connect** → “Connect your application” → copy the connection string.
5. Put that string in Render’s `MONGODB_URI` (replace `<password>` with the user password).

---

## 4. Summary

| Part       | Where   | URL / Env |
|-----------|--------|------------|
| Backend   | Render | e.g. `https://finance-manager-api.onrender.com` |
| Frontend  | Vercel | e.g. `https://finance-manager-xxx.vercel.app` |
| Database  | MongoDB Atlas | Connection string in `MONGODB_URI` on Render |

- **Frontend** needs: `VITE_API_URL` = Render backend URL (no `/api`).
- **Backend** needs: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_URL` = Vercel frontend URL.

After both are deployed and env vars are set, open the Vercel URL and use the app; it will talk to the API on Render.
