import { logRequest, logError, logRawHttp, logAuth } from '$lib/server/logging/logger';
import type { Handle } from '@sveltejs/kit';
import { pb } from '$lib/pb/pocketbase';

export const handle: Handle = async ({ event, resolve }) => {
  const { request, cookies, url } = event;
  
  // Skip logging for static assets and background requests
  if (url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.ico') ||
      url.pathname.includes('__data.json')) {
    return await resolve(event);
  }
  
  // Check if this is an auth attempt
  const isLogin = url.pathname.includes('/login') && request.method === 'POST';
  const isRegister = url.pathname.includes('/registration') && request.method === 'POST';
  const isAuthRequest = isLogin || isRegister;
  
  // Variables for auth logging
  let authEmail = '';
  let authAction = isLogin ? 'login' : 'register';
  
  // For auth requests, try to extract email for logging
  if (isAuthRequest) {
    try {
      const clone = request.clone();
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const body = await clone.json();
        authEmail = body.email || body.identity || '';
      } else if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await clone.formData();
        const emailValue = formData.get('email') || formData.get('identity');
        authEmail = emailValue ? emailValue.toString() : '';
      }
    } catch (error) {
      // Ignore parsing errors
    }
  }
  
  try {
    // Log the raw HTTP request (sensitive data will be filtered in the logger)
    logRawHttp(
      'request',
      request.method,
      request.url,
      request.headers,
      undefined, // Don't include body for auth requests
      isAuthRequest
    );
    
    // Process the request
    const response = await resolve(event);
    
    // Get username if logged in
    let username = null;
    if (cookies.get('pb_auth')) {
      try {
        pb.authStore.loadFromCookie(`pb_auth=${cookies.get('pb_auth')}`);
        if (pb.authStore.isValid && pb.authStore.model) {
          username = pb.authStore.model.email || pb.authStore.model.username || null;
        }
      } catch {
        // Ignore auth errors
      }
    }
    
    // Log auth attempts
    if (isAuthRequest && authEmail) {
      const success = response.status >= 200 && response.status < 300;
      const reason = success ? undefined : `HTTP status: ${response.status}`;
      logAuth(authEmail, authAction as 'login' | 'register', success, reason);
    }
    
    // Log all requests with response status code and username
    logRequest(request, response.status, username);
    
    // Log the raw HTTP response
    logRawHttp(
      'response',
      request.method,
      request.url,
      response.headers,
      undefined, // Don't include response body
      isAuthRequest
    );
    
    return response;
  } catch (error) {
    // Log errors with stack trace
    if (error instanceof Error) {
      logError(error);
    } else {
      logError(new Error(String(error)));
    }
    throw error;
  }
}; 