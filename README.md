# Resume Builder

A full-stack Resume Builder application that helps users create professional resumes with an easy-to-use interface and AI-powered features.

## Features

- User registration and login
- Secure authentication using JWT
- Resume creation and management
- AI-powered resume assistance using Gemini
- Image uploads using ImageKit
- Admin account and role management
- MongoDB database integration
- Responsive frontend interface

## Tech Stack

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Backend**
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcrypt

**Third-party Services**
- MongoDB Atlas
- Google Gemini API
- ImageKit
- Render
- Vercel

## Project Structure

```text
ResumeBuilder/
├── client/              # React frontend
├── server/               # Node.js backend
├── .gitignore
├── package.json
├── AUTHENTICATION.md
├── memory.md
├── tasks.md
└── README.md
```

## Prerequisites

Before running the project, install:

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- MongoDB Atlas account
- Gemini API key (optional, for AI features)
- ImageKit account (optional, for image uploads)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Sagar-rolex/ResumeBuilder.git
```

### 2. Navigate to the project

```bash
cd ResumeBuilder
```

### 3. Install dependencies

Install root, frontend, and backend dependencies as required by the project:

```bash
npm install
cd client
npm install
cd ../server
npm install
cd ..
```

## Environment Variables

Create a `.env` file inside the `server/` directory.

### Backend Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret used for JWT authentication |
| `CLIENT_URL` | Yes for browser access | Frontend URL allowed by CORS |
| `IMAGEKIT_PRIVATE_KEY` | Optional | ImageKit private API key |
| `GEMINI_API_KEY` | Optional | Google Gemini API key |
| `GEMINI_MODEL` | Optional | Gemini model name |
| `GEMINI_BASE_URL` | Optional | Gemini API endpoint |
| `OPENAI_API_KEY` | Optional | Alternative AI provider key |
| `OPENAI_MODEL` | Optional | OpenAI-compatible model name |
| `OPENAI_BASE_URL` | Optional | Alternative AI endpoint |
| `PORT` | No | Server port; defaults to 3000 locally |

### Frontend Environment Variables

Create a `.env` file inside `client/` if needed.

```env
VITE_BASE_URL=http://localhost:3000/api
```

For production, replace the local URL with your deployed backend URL.

**Security:** Never put database passwords, JWT secrets, or private API keys in frontend variables beginning with `VITE_`.

## Running the Project Locally

Run the backend and frontend in separate terminals from the repository root.

### Start Backend

```powershell
npm run dev:server
```

### Start Frontend

```powershell
npm run dev:client
```

Default local URLs:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Available Scripts

### Root Directory

| Command | Description |
|---|---|
| `npm run dev:server` | Start backend in development mode |
| `npm run dev:client` | Start frontend development server |
| `npm run build:client` | Build frontend for production |
| `npm run start:server` | Start backend in production mode |

### Client Directory

| Command | Description |
|---|---|
| `npm run build` | Build frontend |
| `npm run lint` | Run ESLint |

### Server Directory

| Command | Description |
|---|---|
| `npm start` | Start backend server |
| `npm run server` | Start backend using nodemon |
| `npm run seed:admin` | Create the initial admin account |
| `npm run ai:check` | Check AI provider configuration |

## Deployment

### Backend Deployment – Render

1. Push the project to GitHub.
2. Open [Render](https://render.com/).
3. Create a new **Web Service**.
4. Connect your GitHub repository.
5. Configure the following settings:

| Setting | Value |
|---|---|
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |

6. Add the required backend environment variables in Render.
7. Set `NODE_ENV` to `production`.
8. Deploy the service.

Render automatically provides the `PORT` environment variable. Do not manually set it.

### Frontend Deployment – Vercel

1. Open [Vercel](https://vercel.com/).
2. Import your GitHub repository.
3. Set the Root Directory to `client`.
4. Configure:

| Setting | Value |
|---|---|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

5. Add the production environment variable:

```env
VITE_BASE_URL=https://your-render-service.onrender.com/api
```

6. Deploy the frontend.

After deployment, update the Render `CLIENT_URL` variable with your exact Vercel frontend URL and redeploy the backend.

### MongoDB Atlas Configuration

- Create a production database and database user.
- Add the appropriate backend network access rules.
- Use a secure MongoDB connection string.
- Never commit database credentials to GitHub.

## Admin Account Setup

The project includes an admin provisioning script.

To create the initial admin account:

1. Configure `ADMIN_EMAIL`, `ADMIN_NAME`, and `ADMIN_PASSWORD` in the one-time backend environment.
2. Make sure the password is at least 12 characters long.
3. Run the following command from the `server/` directory:

```powershell
npm run seed:admin
```

The script creates an admin account if one does not already exist. It does not automatically promote an existing regular user.

Remove temporary admin credentials from the environment after provisioning.

## Troubleshooting

| Problem | Possible Solution |
|---|---|
| Backend fails to start | Check Render logs and required environment variables |
| MongoDB connection error | Verify MongoDB URI and Atlas network access |
| CORS error | Check that `CLIENT_URL` matches the deployed frontend URL exactly |
| Frontend cannot connect to backend | Verify `VITE_BASE_URL` ends with `/api` |
| AI features fail | Verify the Gemini or alternative AI credentials and model |
| Vercel nested routes return 404 | Configure an SPA rewrite to `/index.html` |

## Security Notes

- Never upload `.env` files to GitHub.
- Keep database credentials and private API keys on the backend.
- Use a strong, unique JWT secret.
- Use HTTPS in production.
- Restrict MongoDB network access to trusted sources.
- Rotate credentials if they are accidentally exposed.
ADMIN_EMAIL=ResumeBuilder@test.com
ADMIN_NAME= Rolex
ADMIN_PASSWORD=Admintest@123
## Author
**Sagar Sahu**

GitHub: [@Sagar-rolex](https://github.com/Sagar-rolex)

## License

This project is available for personal and educational use. Add a formal license file if you intend to specify reuse and distribution permissions.
