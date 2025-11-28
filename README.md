# Car Souq App

A mobile-first PWA for buying and renting cars, built with React, Vite, Tailwind CSS, and Supabase.

## Setup Instructions

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Supabase Setup**
    - Create a new project in [Supabase](https://supabase.com).
    - Go to the SQL Editor and run the content of `supabase_schema.sql` (found in the root of this project).
    - This will create the `cars` table and the `car-images` storage bucket with the necessary policies.

3.  **Environment Variables**
    - Copy `.env` to `.env.local` (or just edit `.env`).
    - Fill in your Supabase URL and Anon Key:
      ```
      VITE_SUPABASE_URL=https://your-project.supabase.co
      VITE_SUPABASE_ANON_KEY=your-anon-key
      ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```

5.  **Admin Access**
    - Go to `/admin/login` (or click "دخول المشرف" in the menu).
    - Default Credentials (hardcoded in `src/pages/AdminLogin.tsx`):
      - Username: `admin`
      - Password: `password123`

## Features

- **PWA**: Installable on mobile devices.
- **RTL Support**: Fully localized for Arabic.
- **Admin Dashboard**: Add, edit, and delete cars.
- **Image Upload**: Upload multiple images for each car.
- **Filtering**: Filter by category, year, price, type, and color.
- **Dark Mode**: Supports system dark mode (configured in Tailwind).

## Project Structure

- `src/components`: Reusable UI components.
- `src/pages`: Application pages.
- `src/lib`: Supabase client and utilities.
- `src/types`: TypeScript definitions.
- `src/hooks`: Custom hooks (e.g., `useCars`).
