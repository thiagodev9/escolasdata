# EduCare Core

EduCare Core is a modern management system for Brazilian preschools, designed to balance institutional reliability with the nurturing warmth essential to early childhood education.

## Overview

The platform provides school administrators with efficient management tools and parents with a reassuring, modern connection to their child’s daily life. The interface is built with **Friendly Minimalism**, prioritizing organization, safety, and accessibility.

## Tech Stack

- **Framework:** Next.js
- **Styling:** Tailwind CSS (following the EduCare Design System)
- **Database & Auth:** Supabase
- **Testing:** Vitest

## Design Principles

- **Primary (Institutional Blue):** Authority and reliability.
- **Accent (Solar Orange):** Delight, notifications, and key actions.
- **Background (Warm Cream):** Replaces clinical whites for a more welcoming feel.
- **Typography:** **Nunito Sans** for a friendly yet professional character.
- **Shapes:** Consistently rounded (0.5rem to 1rem) to maintain the "child-safe" metaphor.

## Project Structure

- `app/`: Next.js App Router pages and layouts.
- `components/`: Reusable UI components.
- `lib/`: Shared utilities and configurations.
- `supabase/`: Database migrations and configuration.
- `tests/`: Unit and integration tests.

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`.

3. Run the development server:
   ```bash
   npm run dev
   ```

## License

MIT
