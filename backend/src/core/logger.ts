import pino from 'pino';
export const logger = pino({
    level: process.env.LOG_LEVEL ?? 'info',
    redact: {
        paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'password',
            'token',
            'accessToken',
            'refreshToken',
            'apiKey',
            '*.password',
            '*.token',
            '*.accessToken',
            '*.refreshToken',
            '*.apiKey',
            '*.resume',
            '*.resumeText',
            '*.emailBody'
        ],
        censor: '[REDACTED]'
    }
});
