// @ts-ignore - Node.js modules
import fs from 'fs';
// @ts-ignore - Node.js modules
import path from 'path';
// @ts-ignore - Node.js modules
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

// Create http_raw.log file if it doesn't exist
if (!fs.existsSync(RAW_HTTP_LOG_FILE)) {
    fs.writeFileSync(RAW_HTTP_LOG_FILE, '');
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

// Extract body content as text, handling different types
async function extractBodyContent(request: Request): Promise<string | undefined> {
    try {
        const clone = request.clone();
        const contentType = request.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            const body = await clone.json();
            // Filter out password fields
            const sanitizedBody = { ...body };
            if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
            if (sanitizedBody.passwordConfirm) sanitizedBody.passwordConfirm = '[REDACTED]';
            return JSON.stringify(sanitizedBody, null, 2);
        } else if (contentType.includes('text/')) {
            return await clone.text();
        } else if (contentType.includes('application/x-www-form-urlencoded') || 
                  contentType.includes('multipart/form-data')) {
            const formData = await clone.formData();
            const formObj: Record<string, string> = {};
            formData.forEach((value, key) => {
                // Don't include password fields
                if (!key.toLowerCase().includes('password')) {
                    formObj[key] = value.toString();
                } else {
                    formObj[key] = '[REDACTED]';
                }
            });
            return JSON.stringify(formObj, null, 2);
        }
    } catch (e) {
        console.error('Error extracting body content:', e);
    }
    return undefined;
}

// Extract response body content
async function extractResponseContent(response: Response): Promise<string | undefined> {
    try {
        const clone = response.clone();
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
            const body = await clone.json();
            return JSON.stringify(body, null, 2);
        } else if (contentType.includes('text/html')) {
            const text = await clone.text();
            return text.length > 500 ? text.substring(0, 500) + '...[truncated HTML]' : text;
        } else if (contentType.includes('text/')) {
            return await clone.text();
        }
    } catch (e) {
        console.error('Error extracting response content:', e);
    }
    return undefined;
}

// Log raw HTTP requests to separate file
async function logRawHttpRequest(
    request: Request,
    isAuth: boolean = false
): Promise<void> {
    try {
        const url = new URL(request.url);
        const timestamp = new Date().toISOString();
        
        // Start building log entry
        let rawLog = `[${timestamp}] [REQUEST] ${request.method} ${url.pathname}\n`;
        rawLog += 'Headers:\n';
        
        // Add sanitized headers (filter out auth tokens)
        request.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'authorization') {
                return; // Skip authorization headers
            }
            
            if (key.toLowerCase() === 'cookie') {
                // Remove auth tokens from cookie
                const cookies = value.split(';').map(c => c.trim());
                const filteredCookies = cookies.filter(c => 
                    !c.startsWith('auth=') && 
                    !c.startsWith('pb_auth=') &&
                    !c.toLowerCase().includes('token')
                );
                
                if (filteredCookies.length > 0) {
                    rawLog += `  ${key}: ${filteredCookies.join('; ')}\n`;
                }
                return;
            }
            
            // Add other headers normally
            rawLog += `  ${key}: ${value}\n`;
        });
        
        // Add body if it's not an auth request
        if (!isAuth) {
            const contentType = request.headers.get('content-type') || '';
            const isBinary = contentType.includes('image/') || 
                            contentType.includes('audio/') || 
                            contentType.includes('video/') || 
                            contentType.includes('application/octet-stream');
            
            if (!isBinary) {
                const bodyContent = await extractBodyContent(request);
                if (bodyContent) {
                    // Truncate to 2048 bytes
                    const truncatedBody = bodyContent.length > 2048 
                        ? bodyContent.substring(0, 2048) + '...[truncated]' 
                        : bodyContent;
                    
                    rawLog += 'Body:\n';
                    rawLog += truncatedBody + '\n';
                } else {
                    rawLog += 'Body: [No content or unable to extract]\n';
                }
            } else {
                rawLog += 'Body: [Binary content - not logged]\n';
            }
        } else {
            rawLog += 'Body: [Authentication request - body omitted for security]\n';
        }
        
        rawLog += '------------------------------\n';
        
        // Append to raw HTTP log file
        fs.appendFileSync(RAW_HTTP_LOG_FILE, rawLog);
    } catch (error) {
        console.error('Error logging raw HTTP request:', error);
    }
}

// Log raw HTTP responses to separate file
async function logRawHttpResponse(
    request: Request,
    response: Response,
    isAuth: boolean = false
): Promise<void> {
    try {
        const url = new URL(request.url);
        const timestamp = new Date().toISOString();
        
        // Start building log entry
        let rawLog = `[${timestamp}] [RESPONSE] ${request.method} ${url.pathname} - Status: ${response.status}\n`;
        rawLog += 'Headers:\n';
        
        // Add sanitized headers (filter out auth tokens)
        response.headers.forEach((value, key) => {
            if (key.toLowerCase() === 'authorization' || key.toLowerCase() === 'set-cookie' && value.includes('auth=')) {
                return; // Skip authorization headers and auth cookies
            }
            
            // Add other headers normally
            rawLog += `  ${key}: ${value}\n`;
        });
        
        // Add body if it's not an auth request
        if (!isAuth) {
            const contentType = response.headers.get('content-type') || '';
            const isBinary = contentType.includes('image/') || 
                             contentType.includes('audio/') || 
                             contentType.includes('video/') || 
                             contentType.includes('application/octet-stream');
            
            if (!isBinary) {
                const bodyContent = await extractResponseContent(response);
                if (bodyContent) {
                    // Truncate to 2048 bytes
                    const truncatedBody = bodyContent.length > 2048 
                        ? bodyContent.substring(0, 2048) + '...[truncated]' 
                        : bodyContent;
                    
                    rawLog += 'Body:\n';
                    rawLog += truncatedBody + '\n';
                } else {
                    rawLog += 'Body: [No content or unable to extract]\n';
                }
            } else {
                rawLog += 'Body: [Binary content - not logged]\n';
            }
        } else {
            rawLog += 'Body: [Authentication response - body omitted for security]\n';
        }
        
        rawLog += '------------------------------\n';
        
        // Append to raw HTTP log file
        fs.appendFileSync(RAW_HTTP_LOG_FILE, rawLog);
    } catch (error) {
        console.error('Error logging raw HTTP response:', error);
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

export { log, logRequest, logAuth, logError, logRawHttpRequest, logRawHttpResponse, errorWrapper }; 