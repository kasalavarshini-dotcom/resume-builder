# ResumeCraft — Resume Builder

A beginner-friendly full-stack resume builder using HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, and Supabase PostgreSQL.

## Features
- Live resume preview
- Create, list, edit, and delete saved resumes
- Print or save resume as PDF through the browser
- Responsive layout
- Supabase PostgreSQL persistence

## Requirements
- Node.js LTS
- VS Code (recommended)
- Supabase account and project
- Git (optional, for version control)

## Setup

1. Extract the ZIP and open the `resume-builder` folder in VS Code.
2. Open the terminal in that folder and run:

   ```bash
   npm install
   ```

3. In Supabase, open **SQL Editor**, paste the contents of `supabase.sql`, and run it.
4. Copy `.env.example` to a new file named `.env`.
5. Edit `.env` and add your Supabase project URL and server-side secret key. Keep this key private.
6. In the terminal, start the app:

   ```bash
   npm run dev
   ```

7. Open http://127.0.0.1:3000 in your browser.

## GitHub
Create an empty GitHub repository, then run these commands in the project folder:

```bash
git init
git add .
git commit -m "Build Resume Builder"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/resume-builder.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Never commit `.env`.

## Important security note
This is a local learning project, not a production-ready public service. The API does not include user accounts, so do not expose it publicly. Before deployment, add authentication, per-user ownership checks, authorization on every API route, and appropriate database policies.

## Troubleshooting
- **Missing environment variables:** ensure `.env` exists and contains valid values.
- **Table not found:** run `supabase.sql` in the correct Supabase project.
- **Cannot save/load:** verify the project URL, server-side key, network connection, and table.
- **Port in use:** change `PORT=3000` in `.env` to another port, such as `3001`.
