# Step-by-step: Deploy Finance Manager

Do these in order.

---

## Step 1: Push your project to GitHub

1. Open a terminal in your project folder: `c:\Users\sharm\Documents\github\financeManager`

2. If this is **not** a git repo yet, run:
   ```bash
   git init
   ```

3. Create a **.gitignore** in the project root (if you don’t have one) so you don’t push secrets or node_modules:
   ```
   node_modules/
   .env
   backend/.env
   frontend/dist
   .DS_Store
   ```

4. Add and commit everything:
   ```bash
   git add .
   git commit -m "Initial commit - Finance Manager app"
   ```

5. On [github.com](https://github.com) click **New repository**. Name it e.g. `financeManager`. Do **not** add a README (you already have code).

6. Copy the “push an existing repository” commands. In your terminal run (replace with your repo URL):
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/financeManager.git
   git branch -M main
   git push -u origin main
   ```

7. Refresh GitHub — you should see your whole project (backend + frontend) there.

**You’re done when:** The whole project is on GitHub.

---

## Step 2: Deploy the backend on Render

1. Go to [render.com](https://render.com) and sign up / log in (e.g. “Sign up with GitHub”).

2. Click **Dashboard** → **New +** → **Web Service**.

3. Under “Connect a repository”, find **financeManager** and click **Connect**.

4. Fill the form:
   - **Name:** `finance-manager-api`
   - **Region:** Pick one (e.g. Oregon).
   - **Root Directory:** Click “Edit” and type: `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free (if you want free tier)

5. Click **Advanced** and add **Environment Variables**:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your MongoDB Atlas connection string (see Step 2b below if you need one)
   - `JWT_SECRET` = any long random string (e.g. 32+ characters)

6. Click **Create Web Service**. Wait for the first deploy (a few minutes).

7. When it’s live, copy the URL at the top (e.g. `https://finance-manager-api.onrender.com`). You’ll use it in the next step.

**You’re done when:** The backend URL opens and shows something like `{"status":"ok"}` when you visit `https://YOUR-BACKEND-URL.onrender.com/api/health`.

---

### Step 2b: Get MongoDB URI (if you don’t have one)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → sign in or create account.
2. **Build a Database** → choose **FREE** (M0).
3. **Database Access** → **Add New User** → create username/password → **Add User**.
4. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0) → **Confirm**.
5. **Database** → **Connect** → **Connect your application** → copy the connection string.
6. Replace `<password>` in that string with your DB user password.
7. Paste that full string into Render’s `MONGODB_URI` env var, then **Save Changes** and redeploy the service if it was already created.

---

## Step 3: Deploy the frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign up / log in with **GitHub**.

2. Click **Add New…** → **Project**.

3. Import the **financeManager** repo (from the list or search). Click **Import**.

4. Configure the project:
   - **Root Directory:** Click **Edit** → set to `frontend` → **Continue**.
   - **Framework Preset:** Vite (should auto-detect).
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Environment Variables:** Click to add one:
   - **Name:** `VITE_API_URL`
   - **Value:** Your Render backend URL **without** `/api` at the end  
     Example: `https://finance-manager-api.onrender.com`

6. Click **Deploy**. Wait for the build to finish.

7. When it’s done, click **Visit** (or open the URL Vercel shows, e.g. `https://finance-manager-xxx.vercel.app`).

**You’re done when:** The Vercel URL opens your app (login/signup page).

---

## Step 4: Allow frontend in backend (CORS)

1. Go back to **Render** → your **finance-manager-api** service.

2. Open **Environment** (left sidebar).

3. Add a new variable:
   - **Key:** `FRONTEND_URL`
   - **Value:** Your full Vercel URL, e.g. `https://finance-manager-xxx.vercel.app` (no slash at the end)

4. Click **Save Changes**. Render will redeploy automatically.

**You’re done when:** Backend has `FRONTEND_URL` set and the service has finished redeploying.

---

## Step 5: Test the full app

1. Open your **Vercel** URL (frontend).
2. Sign up with a new account.
3. Log in and add a category, then an expense.
4. If that works, the app is live end-to-end.

---

## Quick checklist

- [ ] Step 1: Whole project pushed to GitHub  
- [ ] Step 2: Backend deployed on Render (Root Directory: `backend`), env vars set, health URL works  
- [ ] Step 2b: MongoDB Atlas set up and `MONGODB_URI` in Render (if needed)  
- [ ] Step 3: Frontend deployed on Vercel (Root Directory: `frontend`), `VITE_API_URL` = Render URL  
- [ ] Step 4: `FRONTEND_URL` set on Render to Vercel URL  
- [ ] Step 5: Sign up / login and add expense on the live site  

If something fails at a step, say which step and the exact error message (or a screenshot) and we can fix it.
