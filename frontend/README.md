# XenoCRM Frontend - Campaign Management Platform

A React-based frontend for managing customer campaigns with features like audience segmentation, campaign creation, and analytics.

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Setup Instructions](#setup-instructions)
4. [Environment Configuration](#environment-configuration)
5. [Architecture](#architecture)
6. [Components](#components)
7. [Authentication](#authentication)
8. [State Management](#state-management)

## Features

- Google OAuth Authentication
- Campaign Creation and Management
- Advanced Audience Segmentation
- Real-time Audience Preview
- Campaign History and Analytics
- Responsive Design
- Interactive Rule Builder

## Technology Stack

- **Framework**: React with Vite
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Authentication**: Google OAuth 2.0
- **State Management**: React Context
- **Build Tool**: Vite

## Setup Instructions

1. **Clone the Repository**

```bash
git clone <repository-url>
cd XenoCrm/frontend
```

2. **Install Dependencies**

```bash
npm install
```

3. **Environment Setup**
   Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000
```

4. **Start Development Server**

```bash
npm run dev
```

## Environment Configuration

Configuration is managed through environment variables:

- `VITE_API_URL`: Backend API URL
- Development and production configurations in `vite.config.js`

## Architecture

### Core Components

1. **Authentication Layer**

   - Google OAuth integration
   - Protected routes
   - Session management

2. **Campaign Management**

   - Campaign creation wizard
   - Audience segmentation
   - Message templates

3. **Layout System**
   - Responsive header
   - Navigation
   - Content layout

## Components

### Authentication Components

```jsx
// GoogleLogin Component
const GoogleLogin = () => {
  const { login } = useAuth();
  return (
    <Button variant="contained" onClick={login} startIcon={<GoogleIcon />}>
      Sign in with Google
    </Button>
  );
};
```

### Campaign Components

1. **CampaignCreator**

- Multi-step form
- Rule builder integration
- Audience preview
- Campaign launch

2. **RuleBuilder**

- Drag and drop interface
- Condition groups
- Logic operators (AND/OR)
- Field validations

3. **CampaignHistory**

- Campaign listing
- Status tracking
- Analytics display
- Action management

## State Management

### Auth Context

```jsx
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auth methods
  const login = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Protected Routes

```jsx
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <CircularProgress />;
  }

  return user ? children : <Navigate to="/login" replace />;
}
```

## API Integration

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
```

## Development Guidelines

1. **Component Structure**

- Functional components
- Custom hooks
- Proper prop types
- Error boundaries

2. **Styling**

- MUI theme customization
- Styled components
- Responsive design
- CSS-in-JS

3. **Error Handling**

- API error handling
- User feedback
- Loading states
- Form validation

## Deployment

1. **Prerequisites**

- Node.js 14+
- npm or yarn

2. **Build for Production**

```bash
npm run build
```

3. **Vercel Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Environment Variables for Deployment

Add these in your deployment platform:

```env
VITE_API_URL=https://your-backend-url.com
```

## Project Structure

```
src/
├── components/
│   ├── Auth/
│   ├── Campaign/
│   └── Layout/
├── context/
├── utils/
├── App.jsx
└── main.jsx
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Implement changes
4. Write/update tests
5. Submit pull request

## Available Scripts

```bash
# Development
npm run dev

# Build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License - see LICENSE.md
