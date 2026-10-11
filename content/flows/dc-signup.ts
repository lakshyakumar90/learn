import type { FlowSpec } from './types';

export const dcSignupFlow: FlowSpec = {
  id: 'dc-signup',
  project: 'devconnect',
  title: 'Sign up',
  diagram: 'devconnect-system',
  steps: [
    {
      title: 'Fill the form',
      narration: 'The signup page collects name, email, and password, then dispatches the register thunk.',
      nodes: ['react-app'],
      edges: [],
      path: ['react-app'],
      sources: ['frontend/src/pages/SignupPage.jsx', 'frontend/src/store/slices/authSlice.js'],
    },
    {
      title: 'Register',
      narration: 'The user service posts to the register route; the controller creates the user with a hashed password.',
      nodes: ['react-app', 'services', 'routes', 'controllers', 'models', 'mongo'],
      edges: [
        { from: 'services', to: 'routes', kind: 'solid' },
        { from: 'routes', to: 'controllers', kind: 'solid' },
        { from: 'controllers', to: 'models', kind: 'solid' },
        { from: 'models', to: 'mongo', kind: 'solid' },
      ],
      path: ['react-app', 'services', 'routes', 'controllers', 'models', 'mongo'],
      sources: [
        'frontend/src/services/userService.js',
        'backend/routes/userRoutes.js',
        'backend/controllers/userController.js',
        'backend/models/User.js',
      ],
    },
    {
      title: 'Token stored',
      narration: 'The backend returns a signed token; the app keeps it in local storage and the auth slice.',
      nodes: ['react-app', 'redux'],
      edges: [{ from: 'react-app', to: 'redux', kind: 'dashed' }],
      path: ['react-app', 'redux'],
      sources: ['frontend/src/services/apiClient.js', 'frontend/src/store/slices/authSlice.js'],
    },
    {
      title: 'Log in',
      narration: 'Login posts email and password; the controller compares the hash and issues a fresh token.',
      nodes: ['react-app', 'services', 'routes', 'controllers', 'models'],
      edges: [
        { from: 'services', to: 'routes', kind: 'solid' },
        { from: 'routes', to: 'controllers', kind: 'solid' },
        { from: 'controllers', to: 'models', kind: 'solid' },
      ],
      path: ['react-app', 'services', 'routes', 'controllers', 'models'],
      sources: ['frontend/src/pages/LoginPage.jsx', 'backend/controllers/userController.js'],
    },
    {
      title: 'Session restore',
      narration: 'On every load the app fetches the profile with the stored token; the guard verifies it.',
      nodes: ['react-app', 'services', 'routes', 'controllers'],
      edges: [
        { from: 'services', to: 'routes', kind: 'solid' },
        { from: 'routes', to: 'controllers', kind: 'solid' },
      ],
      path: ['react-app', 'services', 'routes', 'controllers'],
      sources: ['frontend/src/App.jsx', 'backend/middleware/authMiddleware.js'],
    },
  ],
  sources: [
    'frontend/src/pages/SignupPage.jsx',
    'frontend/src/services/userService.js',
    'backend/routes/userRoutes.js',
    'backend/controllers/userController.js',
  ],
};
