# 🎙️ AI Voice Keyboard

[![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.0-green)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://postgresql.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Whisper-orange)](https://openai.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blue)](https://tailwindcss.com/)

> A modern, AI-powered voice dictation application that transforms speech into text with real-time transcription, intelligent silence detection, and responsive waveform visualization.

## ✨ Features

### 🎯 Core Functionality
- **Real-time Voice Transcription**: Convert speech to text instantly using OpenAI's Whisper API
- **Intelligent Silence Detection**: Automatically skips silent periods to save API costs and improve efficiency
- **Continuous Audio Processing**: 5-second overlapping audio chunks for seamless transcription
- **Smart Context Preservation**: Maintains conversation context across audio segments

### 🎨 User Interface
- **Responsive Waveform Visualization**: Real-time audio level visualization with VLC-like fluid animation
- **Dark/Light Theme Support**: Modern UI with customizable themes
- **Mobile-First Design**: Fully responsive across all devices
- **Intuitive Dashboard**: Clean, organized interface for all features

### 📚 Management Features
- **Personal Dictionary**: Custom spelling corrections and term preferences
- **Transcription History**: View, search, and manage past transcriptions
- **User Authentication**: Secure login/signup with NextAuth.js
- **Settings Management**: Customize application preferences

### 🔧 Technical Features
- **Advanced Audio Processing**: Web Audio API integration with RMS amplitude detection
- **Performance Optimized**: Efficient audio slicing and silence detection algorithms
- **Type-Safe**: Full TypeScript implementation with strict type checking
- **Database Integration**: PostgreSQL with Prisma ORM for robust data management

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18.x or higher
- **pnpm** package manager
- **PostgreSQL** database (local or cloud)
- **OpenAI API Key**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-voice-keyboard.git
   cd ai-voice-keyboard
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@hostname:5432/database_name"
   NEXTAUTH_SECRET="your-random-secret-key-minimum-32-characters-long"
   NEXTAUTH_URL="http://localhost:3000"
   OPENAI_API_KEY="sk-your-openai-api-key-here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   pnpm db:generate

   # Run database migrations
   pnpm db:migrate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Technology Stack
- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Radix UI, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js 5
- **AI**: OpenAI Whisper API
- **Audio Processing**: Web Audio API

### Project Structure
```
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── dictionary/           # Dictionary management
│   │   └── transcriptions/       # Transcription API
│   ├── dashboard/                # Protected dashboard pages
│   │   ├── dictate/              # Voice dictation interface
│   │   ├── dictionary/           # Dictionary management
│   │   ├── history/              # Transcription history
│   │   └── settings/             # User settings
│   └── login|signup/             # Authentication pages
├── components/                   # React components
│   ├── dictate/                  # Dictation components
│   ├── dictionary/               # Dictionary components
│   ├── history/                  # History components
│   ├── layout/                   # Layout components
│   ├── providers/                # Context providers
│   ├── settings/                 # Settings components
│   └── ui/                       # Reusable UI components
├── lib/                          # Utility libraries
│   ├── audio/                    # Audio processing utilities
│   ├── transcription/            # Transcription utilities
│   └── utils.ts                  # General utilities
├── server/                       # Server-side code
│   ├── auth/                     # Authentication configuration
│   ├── services/                 # Business logic services
│   └── db.ts                     # Database client
├── prisma/                       # Database schema and migrations
├── public/                       # Static assets
└── types/                        # TypeScript type definitions
```

## 📊 Database Schema

### User Model
```sql
model User {
  id             String           @id @default(uuid())
  name           String           @db.VarChar(100)
  email          String           @unique @db.VarChar(255)
  passwordHash   String           @map("password_hash")
  createdAt      DateTime         @default(now()) @map("created_at")
  transcriptions Transcription[]
  dictionaryItems DictionaryItem[]

  @@map("users")
}
```

### Transcription Model
```sql
model Transcription {
  id        String              @id @default(uuid())
  userId    String              @map("user_id")
  text      String              @db.Text
  audioUrl  String?             @map("audio_url") @db.Text
  duration  Int                 // seconds
  status    TranscriptionStatus @default(PROCESSING)
  createdAt DateTime            @default(now()) @map("created_at")
  user      User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, createdAt(sort: Desc)])
  @@map("transcriptions")
}
```

### Dictionary Item Model
```sql
model DictionaryItem {
  id                String   @id @default(uuid())
  userId            String   @map("user_id")
  term              String   @db.VarChar(255)
  preferredSpelling String   @map("preferred_spelling") @db.VarChar(255)
  createdAt         DateTime @default(now()) @map("created_at")
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, term])
  @@index([userId])
  @@map("dictionary_items")
}
```

## 🔌 API Reference

### Authentication Endpoints

#### POST `/api/auth/signup`
Create a new user account.
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

#### POST `/api/auth/signin`
Authenticate an existing user.
```json
{
  "email": "string",
  "password": "string"
}
```

### Transcription Endpoints

#### POST `/api/transcriptions`
Upload audio slice for transcription.
```json
{
  "audioSlice": "base64-encoded-audio",
  "context": "previous-transcription-context",
  "sessionId": "session-identifier",
  "sequence": 0,
  "isFinal": false
}
```

#### GET `/api/transcriptions`
Retrieve user's transcription history.
```typescript
GET /api/transcriptions?limit=50&cursor=uuid
```

### Dictionary Endpoints

#### GET `/api/dictionary`
Retrieve user's dictionary items.
```typescript
GET /api/dictionary
```

#### POST `/api/dictionary`
Add new dictionary item.
```json
{
  "term": "string",
  "preferredSpelling": "string"
}
```

## 🎯 Usage Guide

### Voice Dictation

1. **Navigate to Dictate**: Go to `/dashboard/dictate`
2. **Grant Permissions**: Allow microphone access when prompted
3. **Start Recording**: Click the record button (microphone icon)
4. **Speak Clearly**: Dictate your text naturally
5. **Real-time Transcription**: Watch text appear as you speak
6. **Stop Recording**: Click the stop button (square icon)
7. **Review & Edit**: Edit the transcribed text if needed
8. **Save**: Click "Copy" or "Download" to use your text

### Managing Dictionary

1. **Access Dictionary**: Navigate to `/dashboard/dictionary`
2. **Add Terms**: Click "Add Term" and specify custom spellings
3. **Edit Terms**: Modify existing dictionary entries
4. **Remove Terms**: Delete unnecessary entries

### Viewing History

1. **Access History**: Go to `/dashboard/history`
2. **Browse Transcriptions**: View past recordings chronologically
3. **Search**: Use the search function to find specific transcriptions
4. **Delete**: Remove unwanted transcriptions

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm build           # Build for production
pnpm start           # Start production server
pnpm lint            # Run ESLint
pnpm typecheck       # Run TypeScript type checking

# Database
pnpm db:generate     # Generate Prisma client
pnpm db:migrate      # Run database migrations
pnpm db:studio       # Open Prisma Studio
pnpm db:reset        # Reset database
pnpm db:pull         # Pull database schema
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="postgresql://user:password@hostname:5432/database_name"

# Authentication
NEXTAUTH_SECRET="your-random-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# AI Service
OPENAI_API_KEY="sk-your-openai-api-key-here"
```

## 🔐 Security

### Authentication
- Secure password hashing with bcrypt
- JWT-based session management via NextAuth.js
- Protected API routes with middleware

### Data Protection
- User data isolation (users can only access their own data)
- Secure environment variable management
- HTTPS enforcement in production

### API Security
- Input validation with Zod schemas
- Rate limiting considerations
- CORS configuration

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   pnpm lint
   pnpm typecheck
   ```
5. **Commit your changes**
   ```bash
   git commit -m "Add your feature description"
   ```
6. **Push to your branch**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request**

### Code Standards
- Use TypeScript for all new code
- Follow ESLint configuration
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for the Whisper API
- **Railway** for the Next.js platform
- **Prisma** for the database toolkit
- **Radix UI** for accessible components
- **Tailwind CSS** for the styling system

---

**Made with ❤️ by Sid.**

---

## 🔄 Recent Updates

### v0.1.0
- ✅ **Advanced Audio Processing**: Implemented Web Audio API with RMS amplitude detection
- ✅ **Silence Detection**: Smart filtering of silent audio to reduce API costs
- ✅ **Fluid Waveform**: VLC-like continuous animation with voice-responsive visualization
- ✅ **Type-Safe Architecture**: Full TypeScript implementation with strict checking
- ✅ **Production-Ready**: Optimized build process and deployment configuration