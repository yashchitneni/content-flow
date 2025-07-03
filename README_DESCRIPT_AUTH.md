# Descript OAuth 2.0 Authentication Module

This module implements secure OAuth 2.0 authentication for Descript integration in ContentFlow.

## Features

- **OAuth 2.0 with PKCE**: Implements the Authorization Code flow with Proof Key for Code Exchange (PKCE) for enhanced security
- **Token Encryption**: All tokens are encrypted using AES-256-GCM before storage
- **Automatic Token Refresh**: Background timer automatically refreshes tokens before expiry
- **Secure Token Storage**: Tokens stored in platform-specific secure locations
- **React Context Integration**: Full React context and hooks for easy integration

## Architecture

### Backend (Rust/Tauri)

1. **`descript_auth.rs`**: Core authentication logic
   - PKCE challenge generation
   - Token exchange and refresh
   - Encryption/decryption using AES-256-GCM
   - Token storage management

2. **`auth.rs`**: Tauri command handlers
   - `initiate_auth`: Start OAuth flow
   - `handle_auth_callback`: Process authorization code
   - `get_auth_state`: Check current authentication status
   - `refresh_auth`: Manually refresh tokens
   - `logout`: Clear stored tokens
   - `get_access_token`: Get current access token with auto-refresh

### Frontend (React/TypeScript)

1. **`AuthContext.tsx`**: Global authentication state management
   - Provides auth state to entire app
   - Handles auth events from backend
   - Exposes auth methods

2. **Components**:
   - `Button`: Reusable button atom with loading states
   - `AuthStatus`: Auth status display molecule
   - `AuthGuard`: Protected route wrapper organism
   - `AuthCallback`: OAuth callback handler screen

3. **`useDescriptApi`**: Hook for authenticated API calls
   - Automatic token injection
   - Auto-retry on 401 with token refresh
   - Type-safe API methods

## Usage

### Setup

1. Set environment variables:
```env
DESCRIPT_CLIENT_ID=your_client_id
DESCRIPT_CLIENT_SECRET=your_client_secret
```

2. Initialize auth manager in Tauri:
```rust
let auth_manager = AuthManager::new(
    env::var("DESCRIPT_CLIENT_ID").unwrap(),
    env::var("DESCRIPT_CLIENT_SECRET").unwrap()
);
```

3. Wrap React app with AuthProvider:
```tsx
<AuthProvider>
  <App />
</AuthProvider>
```

### Authentication Flow

1. User clicks "Connect Descript" button
2. App generates PKCE verifier and challenge
3. User redirected to Descript authorization page
4. After authorization, callback URL opened in app
5. App exchanges code for tokens
6. Tokens encrypted and stored
7. Auto-refresh timer started

### Using the API

```tsx
const { get, post, isLoading, error } = useDescriptApi();

// Get projects
const projects = await get('/projects');

// Create transcript
const transcript = await post('/projects/:id/transcripts', {
  name: 'My Transcript'
});
```

## Security Features

- **PKCE**: Prevents authorization code interception
- **State Parameter**: CSRF protection
- **Token Encryption**: AES-256-GCM encryption at rest
- **Secure Storage**: Platform-specific secure directories
- **Auto Token Refresh**: Tokens refreshed before expiry
- **No Token Exposure**: Tokens never exposed to frontend

## Error Handling

All errors are properly typed and include:
- Error message for display
- Error code for programmatic handling
- Proper error boundaries in React

## Token Refresh

- Automatic refresh 5 minutes before expiry
- Manual refresh available via API
- Refresh failures trigger re-authentication
- Events emitted on refresh for UI updates