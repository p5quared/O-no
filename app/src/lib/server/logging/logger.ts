import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Log file paths
const LOG_DIR = path.join(__dirname, '../../../../../logs');
const APP_LOG_FILE = path.join(LOG_DIR, 'app.log');
const RAW_HTTP_LOG_FILE = path.join(LOG_DIR, 'http_raw.log');

// Create logs directory if it doesn't exist
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Create log files if they don't exist
if (!fs.existsSync(APP_LOG_FILE)) {
    fs.writeFileSync(APP_LOG_FILE, '');
}
if (!fs.existsSync(RAW_HTTP_LOG_FILE)) {
    fs.writeFileSync(RAW_HTTP_LOG_FILE, '');
}

// Helper function to format date
function formatDate(date: Date): string {
    return date.toISOString();
}

// Helper to remove auth tokens from headers
function sanitizeHeaders(headers: Headers): Record<string, string> {
    const sanitized: Record<string, string> = {};
    
    headers.forEach((value, key) => {
        // Skip auth token
        if (key.toLowerCase() === 'authorization') {
            // Skip authorization header entirely
            return;
        } 
        
        if (key.toLowerCase() === 'cookie') {
            // For cookies, we need to remove just the auth token
            const cookies = value.split(';').map(cookie => cookie.trim());
            const sanitizedCookies = cookies.filter(cookie => !cookie.startsWith('auth='));
            if (sanitizedCookies.length > 0) {
                sanitized[key] = sanitizedCookies.join('; ');
            }
            return;
        }
        
        sanitized[key] = value;
    });
    
    return sanitized;
}

// Log to app.log
function log(message: string): void {
    const timestamp = formatDate(new Date());
    const logEntry = `[${timestamp}] ${message}\n`;
    
    fs.appendFileSync(APP_LOG_FILE, logEntry);
    console.log(logEntry.trim());
}

// Log request with response code
function logRequest(request: Request, responseStatus: number, username?: string): void {
    const url = new URL(request.url);
    const ipAddress = request.headers.get('x-forwarded-for') || 'unknown';
    
    let logMessage = `[REQUEST] ${request.method} ${url.pathname} from ${ipAddress}`;
    
    if (username) {
        logMessage += ` user=${username}`;
    }
    
    logMessage += ` - Status: ${responseStatus}`;
    
    log(logMessage);
}

// Log authentication attempts
function logAuth(username: string, action: 'login' | 'register', success: boolean, reason?: string): void {
    let logMessage = `[AUTH] ${username} attempted to ${action}`;
    
    if (success) {
        logMessage += ' - SUCCESS';
    } else {
        logMessage += ` - FAILED: ${reason || 'Unknown reason'}`;
    }
    
    log(logMessage);
}

// Log errors with stack trace
function logError(error: Error): void {
    const errorMessage = `[ERROR] ${error.message}\n${error.stack}`;
    log(errorMessage);
}

// Log raw HTTP request/response (limited to 2048 bytes)
function logRawHttp(
    type: 'request' | 'response',
    method: string,
    url: string,
    headers: Headers,
    body?: string,
    isLogin: boolean = false
): void {
    const timestamp = formatDate(new Date());
    const sanitizedHeaders = sanitizeHeaders(headers);
    
    let rawLogEntry = `[${timestamp}] [${type.toUpperCase()}] ${method} ${url}\n`;
    rawLogEntry += 'Headers:\n';
    
    Object.entries(sanitizedHeaders).forEach(([key, value]) => {
        rawLogEntry += `  ${key}: ${value}\n`;
    });
    
    // Only add body if it's not a login/register request and it's text content
    if (body && !isLogin && headers.get('content-type')?.includes('application/json')) {
        const truncatedBody = body.length > 2048 ? body.substring(0, 2048) + '...' : body;
        rawLogEntry += 'Body:\n';
        rawLogEntry += `${truncatedBody}\n`;
    }
    
    rawLogEntry += '------------------------------\n';
    
    fs.appendFileSync(RAW_HTTP_LOG_FILE, rawLogEntry);
}

export {
    log,
    logRequest,
    logAuth,
    logError,
    logRawHttp
}; 
