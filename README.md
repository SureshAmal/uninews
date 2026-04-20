# UniNews

UniNews is a university news platform designed to help students and faculty share stories, follow writers, and engage with their campus community.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Supabase & Iron Session
- **Editor**: Tiptap

## Features

- **Social News Feed**: A ranked feed of campus stories and news.
- **Rich Text Editor**: Integrated Tiptap-based direct preview editor for intuitive article creation.
- **User Profiles**: Follow writers and build an audience within the campus.
- **Engagement**: Bookmark, tag, and interact with posts across the platform.
- **Responsive Layout**: A modern, newspaper-inspired masthead and article card design.

## Getting Started

### Prerequisites

Ensure you have the following installed:
- Node.js (v18 or higher)
- PostgreSQL database
- Supabase account and project

### Installation

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add the necessary environment variables. Required variables include your database connection URL and Supabase credentials.
   ```bash
   DATABASE_URL=postgres_instance_url
   SESSION_SECRET=your_session_secret
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=ur_publisher_key
   SUPABASE_SERVICE_ROLE_KEY=service_role_key
   ```

3. **Initialize the Database**
   Push the schema to your PostgreSQL database:
   ```bash
   npx drizzle-kit push
   ```

4. **Start the Development Server**
   ```bash
   bun run dev
   ```
   Open `http://localhost:3000` in your browser.

## Project Structure

- `app/`: Next.js App Router pages and API routes.
- `components/`: Reusable React components including the newspaper layouts, text editor, and UI elements.
- `lib/`: Core application logic, database actions, feed ranking algorithms, and authentication.
- `utils/`: Helper utilities and configuration files.
