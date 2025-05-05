import { logRequest, logError, logRawHttp, logAuth } from '$lib/server/logging/logger';
import type { Handle } from '@sveltejs/kit';
import { pb } from '$lib/pb/pocketbase';

export const handle: Handle = async ({ event, resolve }) => {
  const { request, cookies, url } = event;

  // 1. ENHANCED: More comprehensive detection of authentication attempts
  // Form-based auth via UI
  const isLogin = url.pathname.includes('/login') && request.method === 'POST';
  const isRegister = url.pathname.includes('/registration') && request.method === 'POST';
  
  // PocketBase API auth endpoints - expanded patterns to ensure we catch all variants
  const isPocketBaseAuth = 
    request.method === 'POST' && (
      url.pathname.includes('/api/collections/users/auth') ||
      url.pathname.includes('/auth-with-password') ||
      request.headers.get('referer')?.includes('/login')
    );
    
  const isPocketBaseRegister = 
    request.method === 'POST' && (
      (url.pathname.includes('/api/collections/users/records') && !url.pathname.includes('/auth')) ||
      request.headers.get('referer')?.includes('/registration')
    );
    
  // Any of the above conditions indicates an auth request
  const isAuthRequest = isLogin || isRegister || isPocketBaseAuth || isPocketBaseRegister;

  // 2. Is it an initial page load (requesting the main HTML document)?
  const acceptHeader = request.headers.get('accept') || '';
  const secFetchDest = request.headers.get('sec-fetch-dest') || '';
  const isInitialPageLoad = request.method === 'GET' &&
                           (acceptHeader.includes('text/html') || secFetchDest === 'document') &&
                           !url.pathname.includes('.') && // Avoid static assets like .css, .js
                           !url.pathname.includes('__data.json') &&
                           !url.pathname.includes('_app/');

  // 3. Is it a form submission (other than auth)?
  const isFormSubmission = request.method === 'POST' && !isAuthRequest;

  // 4. Determine if this request should be logged based on the above criteria
  const shouldLogRequest = isAuthRequest || isInitialPageLoad || isFormSubmission;

  // --- If not logging, resolve early --- 
  if (!shouldLogRequest) {
      // Exception: Always resolve immediately for known static assets to avoid extra processing
      if (url.pathname.endsWith('.js') || 
          url.pathname.endsWith('.css') || 
          url.pathname.endsWith('.ico') ||
          url.pathname.includes('_app/immutable/')) { 
          return await resolve(event);
      }
      // For other non-logged requests, still resolve but don't log
      // We simply proceed to resolve without calling logging functions later.
  }

  // --- Prepare for logging (if needed) --- 
  let authEmail = '';
  let authAction = (isLogin || isPocketBaseAuth) ? 'login' : 'register';
  
  // Enhanced extraction of auth details for more reliable logging
  if (isAuthRequest) {
    try {
      const clone = request.clone();
      const contentType = request.headers.get('content-type') || '';
      
      // For JSON requests (API calls)
      if (contentType.includes('application/json')) {
        try {
          const body = await clone.json();
          authEmail = body.email || body.identity || '';
          
          // If request is to create a record but not specifically an auth endpoint
          if (isPocketBaseRegister && !authEmail && body.username) {
            authEmail = body.username; // Some register flows might use username instead
          }
        } catch (e) {
          console.error('Error parsing JSON auth body:', e);
        }
      } 
      // For form submissions
      else if (contentType.includes('application/x-www-form-urlencoded') || 
               contentType.includes('multipart/form-data')) {
        try {
          const formData = await clone.formData();
          const emailValue = formData.get('email') || formData.get('identity') || formData.get('username');
          authEmail = emailValue ? emailValue.toString() : '';
        } catch (e) {
          console.error('Error parsing form data:', e);
        }
      }
      
      // Last resort - try to extract email from URL for certain operations
      if (!authEmail && url.searchParams.has('email')) {
        authEmail = url.searchParams.get('email') || '';
      }
    } catch (e) {
      console.error('Error extracting auth info for logging:', e);
      // Ignore extraction errors for logging purposes
    }
  }

  try {
    // Process the request
    const response = await resolve(event);

    // Get username if logged in (for subsequent logged requests)
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

    // IMPORTANT: Log Authentication Attempts
    if (isAuthRequest) {
      // If we couldn't extract email from request body, try to get it from the response
      if (!authEmail && response.headers.get('content-type')?.includes('application/json')) {
        try {
          const cloneResponse = response.clone();
          const responseData = await cloneResponse.json();
          if (responseData.email || responseData.username) {
            authEmail = responseData.email || responseData.username;
          } else if (responseData.record?.email || responseData.record?.username) {
            authEmail = responseData.record.email || responseData.record.username;
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // Only log if we have an email to attach to the log
      if (authEmail) {
        const success = response.status >= 200 && response.status < 300;
        let reason = undefined;
        
        if (!success) {
          if (response.status === 400) {
            reason = "Invalid request (missing or invalid data)";
          } else if (response.status === 401 || response.status === 403) {
            reason = (authAction === 'login') ? "Wrong username or password" : "Registration failed (permissions)";
          } else if (response.status === 404) {
            reason = "User not found";
          } else if (response.status === 409) {
            reason = "Email already exists";
          } else {
            reason = `Failed with HTTP status: ${response.status}`;
          }
        }
        
        // Log the authentication attempt
        logAuth(authEmail, authAction as 'login' | 'register', success, reason);
      }
    }

    // Log the main request details if it meets our criteria
    if (shouldLogRequest) {
      // For raw request logging (Auth and Form Submissions)
      if (isAuthRequest || isFormSubmission) {
        logRawHttp(
          'request',
          request.method,
          request.url,
          request.headers,
          undefined, // Don't include body for auth requests
          isAuthRequest
        );
      }
    
      // Log all qualifying requests
      logRequest(request, response.status, username);

      // For raw response logging (Auth and Form Submissions)
      if (isAuthRequest || isFormSubmission) {
        logRawHttp(
          'response',
          request.method,
          request.url,
          response.headers,
          undefined, // Don't include response body
          isAuthRequest
        );
      }
    }

    return response;
  } catch (error) {
    // Always log errors
    console.error('Server Error Caught in Hook:', error); // Keep console error for server issues
    if (error instanceof Error) {
      logError(error);
    } else {
      logError(new Error(String(error)));
    }
    throw error; // Re-throw the error so SvelteKit handles it
  }
}; 