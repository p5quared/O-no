import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Set up log paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_DIR = path.join(__dirname, '../../../../logs');
const APP_LOG_FILE = path.join(LOG_DIR, 'app.log');
const RAW_HTTP_LOG_FILE = path.join(LOG_DIR, 'http_raw.log');

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Log to app.log file
function log(message: string): void {
    try {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}\n`;
        fs.appendFileSync(APP_LOG_FILE, logEntry);
    } catch (error) {
        console.error('Error writing to log:', error);
    }
}

// Log requests with response status
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

// Log auth attempts
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

// Log raw HTTP to separate file
function logRawHttp(
    type: 'request' | 'response',
    method: string,
    url: string,
    headers: Headers,
    body?: string,
    isAuth: boolean = false
): void {
    try {
        const timestamp = new Date().toISOString();
        
        // Start building log entry
        let rawLog = `[${timestamp}] [${type.toUpperCase()}] ${method} ${url}\n`;
        rawLog += 'Headers:\n';
        
        // Add sanitized headers (filter out auth tokens)
        headers.forEach((value, key) => {
            if (key.toLowerCase() === 'authorization') {
                return; // Skip authorization headers
            }
            
            if (key.toLowerCase() === 'cookie') {
                // Remove auth tokens from cookie
                const cookies = value.split(';').map(c => c.trim());
                const filteredCookies = cookies.filter(c => 
                    !c.startsWith('auth=') && !c.startsWith('pb_auth=')
                );
                
                if (filteredCookies.length > 0) {
                    rawLog += `  ${key}: ${filteredCookies.join('; ')}\n`;
                }
                return;
            }
            
            // Add other headers normally
            rawLog += `  ${key}: ${value}\n`;
        });
        
        // Add body if it's not an auth request, not binary, and not too large
        if (body && !isAuth) {
            const contentType = headers.get('content-type') || '';
            const isBinary = contentType.includes('image/') || 
                            contentType.includes('audio/') || 
                            contentType.includes('video/') || 
                            contentType.includes('application/octet-stream');
            
            if (!isBinary) {
                // Truncate to 2048 bytes
                const truncatedBody = body.length > 2048 ? body.substring(0, 2048) + '...' : body;
                rawLog += 'Body:\n';
                rawLog += truncatedBody + '\n';
            } else {
                rawLog += 'Body: [Binary content - not logged]\n';
            }
        }
        
        rawLog += '------------------------------\n';
        
        // Append to raw HTTP log file
        fs.appendFileSync(RAW_HTTP_LOG_FILE, rawLog);
    } catch (error) {
        console.error('Error logging raw HTTP:', error);
    }
}

// Error wrapper function
function errorWrapper<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
        try {
            const result = await fn();
            resolve(result);
        } catch (error) {
            if (error instanceof Error) {
                logError(error);
            } else {
                logError(new Error(String(error)));
            }
            reject(error);
        }
    });
}

export { log, logRequest, logAuth, logError, logRawHttp, errorWrapper }; 