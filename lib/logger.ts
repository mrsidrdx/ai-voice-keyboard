type LogLevel = "info" | "warn" | "error" | "debug";

type LogContext = {
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
};

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...context,
  };
  
  return JSON.stringify(logEntry);
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    console.log(formatLog("info", message, context));
  },
  
  warn: (message: string, context?: LogContext) => {
    console.warn(formatLog("warn", message, context));
  },
  
  error: (message: string, error?: Error | unknown, context?: LogContext) => {
    const errorContext = error instanceof Error
      ? { error: error.message, stack: error.stack }
      : { error: String(error) };
    
    console.error(formatLog("error", message, { ...errorContext, ...context }));
  },
  
  debug: (message: string, context?: LogContext) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatLog("debug", message, context));
    }
  },
};

