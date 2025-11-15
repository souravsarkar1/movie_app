import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User, UserWithPassword, LoginCredentials, RegisterData } from '../types';

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { setLoading, setError, setUser, logout, clearError } = authSlice.actions;

// Thunk actions (manual)
export const registerUser = (userData: RegisterData) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));

    // Get existing users from AsyncStorage
    const usersJson = await AsyncStorage.getItem('users');
    const users: UserWithPassword[] = usersJson ? JSON.parse(usersJson) : [];

    // Check if user already exists
    const userExists = users.find((u: UserWithPassword) => u.email === userData.email);
    if (userExists) {
      dispatch(setError('User with this email already exists'));
      return;
    }

    // Create new user
    const newUser: UserWithPassword = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString(),
    };

    // Save to users array
    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    dispatch(setUser(userWithoutPassword));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
  }
};

export const loginUser = (credentials: LoginCredentials) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));

    // Get users from AsyncStorage
    const usersJson = await AsyncStorage.getItem('users');
    const users: UserWithPassword[] = usersJson ? JSON.parse(usersJson) : [];

    // Find user with matching credentials
    const user = users.find(
      (u: UserWithPassword) => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      dispatch(setError('Invalid email or password'));
      return;
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    dispatch(setUser(userWithoutPassword));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
  }
};

export default authSlice.reducer;