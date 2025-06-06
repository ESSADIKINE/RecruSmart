import { createContext, useContext, useState, useEffect } from 'react';

// Define our types
interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'recruiter';
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: 'candidate' | 'recruiter') => Promise<void>;
  logout: () => void;
}

// Create context
const AuthContext = createContext<AuthContextType | null>(null);

// Mock users for demonstration
const mockUsers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'candidate@example.com',
    password: 'password',
    role: 'candidate',
    profilePicture: 'https://i.pravatar.cc/150?img=1'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'recruiter@example.com',
    password: 'password',
    role: 'recruiter',
    profilePicture: 'https://i.pravatar.cc/150?img=2'
  }
];

// Provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Login function
  const login = async (email, password) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    
    if (!foundUser) {
      setIsLoading(false);
      throw new Error('Invalid credentials');
    }
    
    const { password: _, ...userWithoutPassword } = foundUser;
    setUser(userWithoutPassword);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    setIsLoading(false);
  };

  // Register function
  const register = async (name, email, password, role) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const existingUser = mockUsers.find(u => u.email === email);
    
    if (existingUser) {
      setIsLoading(false);
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      email,
      role,
      profilePicture: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
    };
    
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setIsLoading(false);
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}