"use client";

import { motion } from "framer-motion";
import { User, Mail, Settings as SettingsIcon, Sparkles } from "lucide-react";

type SettingsContentProps = {
  userName: string;
  userEmail: string;
};

export function SettingsContent({ userName, userEmail }: SettingsContentProps) {
  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-2"
      >
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-[hsl(var(--text))] to-[hsl(var(--text-muted))] bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-[hsl(var(--text-muted))] text-sm sm:text-base">
          Manage your account settings and preferences
        </p>
      </motion.div>

      {/* Account Information Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="rounded-[var(--radius-xl)] border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--surface))]/95 to-[hsl(var(--mist))]/80 p-6 shadow-lg overflow-hidden relative backdrop-blur-sm hover:shadow-xl transition-all duration-300"
      >
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[hsl(var(--brand-500))]/8 to-[hsl(var(--accent))]/8 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--brand-500))] to-[hsl(var(--brand-400))] flex items-center justify-center shadow-lg">
              <User className="h-5 w-5 text-white drop-shadow-sm" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[hsl(var(--text))]">Account Information</h2>
              <p className="text-xs text-[hsl(var(--text-muted))]">Your account details</p>
            </div>
          </div>

          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-start gap-3 p-4 rounded-[var(--radius-lg)] bg-[hsl(var(--surface))]/80 backdrop-blur-sm border border-[hsl(var(--border))] hover:shadow-md transition-all duration-300"
            >
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--cloud))] flex items-center justify-center flex-shrink-0 shadow-sm">
                <User className="h-4 w-4 text-[hsl(var(--text-muted))]" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-[hsl(var(--text-muted))] uppercase tracking-wider">
                  Name
                </label>
                <p className="text-base font-medium text-[hsl(var(--text))] mt-1 truncate">
                  {userName}
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-start gap-3 p-4 rounded-[var(--radius-lg)] bg-[hsl(var(--surface))]/80 backdrop-blur-sm border border-[hsl(var(--border))] hover:shadow-md transition-all duration-300"
            >
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[hsl(var(--muted))] to-[hsl(var(--cloud))] flex items-center justify-center flex-shrink-0 shadow-sm">
                <Mail className="h-4 w-4 text-[hsl(var(--text-muted))]" />
              </div>
              <div className="flex-1 min-w-0">
                <label className="text-xs font-medium text-[hsl(var(--text-muted))] uppercase tracking-wider">
                  Email
                </label>
                <p className="text-base font-medium text-[hsl(var(--text))] mt-1 truncate">
                  {userEmail}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Transcription Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="rounded-[var(--radius-xl)] border border-[hsl(var(--border))] bg-gradient-to-br from-[hsl(var(--surface))]/95 to-[hsl(var(--cloud))]/80 p-6 shadow-lg overflow-hidden relative backdrop-blur-sm hover:shadow-xl transition-all duration-300"
      >
        {/* Decorative gradient */}
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[hsl(var(--accent))]/8 to-[hsl(var(--brand-500))]/8 rounded-full blur-3xl" />
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[hsl(var(--accent))] to-[hsl(var(--success))] flex items-center justify-center shadow-lg">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[hsl(var(--text))]">Transcription Settings</h2>
              <p className="text-xs text-[hsl(var(--text-muted))]">Configure transcription preferences</p>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-4 p-5 rounded-[var(--radius-lg)] bg-gradient-to-br from-[hsl(var(--mist))] to-[hsl(var(--dew))] border border-[hsl(var(--border))]"
          >
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[hsl(var(--brand-500))]/20 to-[hsl(var(--accent))]/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-[hsl(var(--brand-500))]" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-[hsl(var(--text))] mb-1">
                AI-Powered Transcription
              </h3>
              <p className="text-sm text-[hsl(var(--text-muted))] leading-relaxed">
                Currently using <span className="font-medium text-[hsl(var(--text))]">GPT 4o Transcribe</span> model with optimized settings for maximum accuracy. Advanced settings coming soon.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--success))] animate-pulse" />
                <span className="text-xs font-medium text-[hsl(var(--success))]">Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

