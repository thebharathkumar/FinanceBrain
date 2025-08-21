# Overview

This is a modern financial management application called FinanceAI that helps users track expenses, manage budgets, monitor investments, and receive AI-powered financial insights. The application features a comprehensive dashboard with transaction tracking, budget management, goal setting, investment monitoring, and intelligent expense categorization using OpenAI's API. The platform provides users with personalized financial insights and automated receipt analysis to streamline expense tracking.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side uses React with TypeScript, built with Vite for fast development and optimized builds. The UI is built on shadcn/ui components with Radix UI primitives and styled using Tailwind CSS with custom CSS variables for consistent theming. The application uses Wouter for lightweight client-side routing and TanStack React Query for server state management and caching.

**Key Frontend Design Decisions:**
- **Component Library**: Chose shadcn/ui for consistent, accessible UI components with built-in dark mode support
- **Routing**: Selected Wouter over React Router for its minimal bundle size and simple API
- **State Management**: Used TanStack React Query to handle server state, caching, and background refetching automatically
- **Styling**: Implemented Tailwind CSS with CSS custom properties for theme consistency and easy customization

## Backend Architecture  

The server is built with Express.js and follows a RESTful API design pattern. The application uses a modular storage abstraction layer that defines interfaces for all data operations, allowing for easy database switching. Currently implements in-memory storage with plans for PostgreSQL integration via Drizzle ORM.

**Key Backend Design Decisions:**
- **Storage Pattern**: Implemented an abstract storage interface to allow switching between different database implementations
- **API Design**: RESTful endpoints organized by feature (dashboard, transactions, budgets, etc.)
- **Middleware**: Custom request logging middleware to track API performance and responses
- **Error Handling**: Centralized error handling middleware for consistent error responses

## Data Storage Architecture

The application is configured to use PostgreSQL as the primary database through Drizzle ORM, with comprehensive schema definitions for users, accounts, transactions, budgets, goals, investments, and AI insights. The schema includes proper foreign key relationships and uses UUIDs for primary keys.

**Database Design Decisions:**
- **ORM Choice**: Selected Drizzle ORM for type-safe database queries and excellent TypeScript integration
- **Schema Design**: Normalized relational design with proper foreign key constraints
- **Data Types**: Uses decimal types for financial data to ensure precision

## AI Integration

The application integrates with Google's Gemini AI model for intelligent financial features including expense categorization, receipt analysis, and personalized spending insights. The AI service layer provides structured interfaces for different types of financial analysis.

**AI Architecture Decisions:**
- **Model Selection**: Uses Gemini 2.5 Pro for superior reasoning capabilities in financial contexts and multimodal support
- **Service Layer**: Abstracted AI operations into dedicated service functions with typed interfaces
- **Data Processing**: Structured prompts and JSON response schemas for consistent AI-generated insights
- **Multimodal Support**: Gemini enables image analysis for receipt scanning and OCR capabilities

## Authentication & Security

While authentication scaffolding exists in the schema with user management tables, the current implementation uses a mock user ID system. The application is prepared for session-based authentication with proper user isolation.

## Development & Build System

The project uses a monorepo structure with shared TypeScript types between client and server. Vite handles the frontend build process while esbuild bundles the backend for production. The development setup includes hot module replacement and automatic server restarts.

**Build System Decisions:**
- **Monorepo Structure**: Shared types between frontend and backend in a `/shared` directory
- **Development Tools**: Vite for frontend development with HMR, tsx for backend development
- **Production Build**: Separate build processes optimized for each environment

# External Dependencies

## Database
- **Neon Database**: PostgreSQL-compatible serverless database for production hosting
- **Drizzle ORM**: Type-safe database toolkit for schema management and queries
- **Connection**: Uses `@neondatabase/serverless` for optimized serverless database connections

## AI Services
- **Gemini API**: Google's Gemini 2.5 Pro model for expense categorization, receipt analysis, and financial insights generation
- **Use Cases**: Automated transaction categorization, receipt OCR and parsing through image analysis, personalized spending advice with JSON-structured responses

## UI Framework
- **Radix UI**: Headless UI primitives for accessibility and keyboard navigation
- **Tailwind CSS**: Utility-first CSS framework for styling and responsive design
- **Recharts**: Chart library for financial data visualization and spending trends

## Development Tools
- **Replit Integration**: Vite plugin for development banner and cartographer for code mapping
- **TypeScript**: Full type safety across frontend, backend, and shared code
- **React Query**: Server state management, caching, and data synchronization

## Runtime & Hosting
- **Node.js**: Server runtime with ES modules support
- **Express.js**: Web framework for REST API endpoints
- **Session Management**: PostgreSQL session store with `connect-pg-simple`