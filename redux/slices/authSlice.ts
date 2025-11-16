import { createSlice } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User, UserWithPassword, LoginCredentials, RegisterData } from '../types';

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

export const registerUser = (userData: RegisterData) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));

    const usersJson = await AsyncStorage.getItem('users');
    const users: UserWithPassword[] = usersJson ? JSON.parse(usersJson) : [];

    const userExists = users.find((u: UserWithPassword) => u.email === userData.email);
    if (userExists) {
      dispatch(setError('User with this email already exists'));
      return;
    }

    const newUser: UserWithPassword = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      password: userData.password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));

    const { password, ...userWithoutPassword } = newUser;
    dispatch(setUser(userWithoutPassword));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
  }
};

export const loginUser = (credentials: LoginCredentials) => async (dispatch: any) => {
  try {
    dispatch(setLoading(true));

    const usersJson = await AsyncStorage.getItem('users');
    const users: UserWithPassword[] = usersJson ? JSON.parse(usersJson) : [];

    const user = users.find(
      (u: UserWithPassword) => u.email === credentials.email && u.password === credentials.password
    );

    if (!user) {
      dispatch(setError('Invalid email or password'));
      return;
    }

    const { password, ...userWithoutPassword } = user;
    dispatch(setUser(userWithoutPassword));
  } catch (error) {
    dispatch(setError(error instanceof Error ? error.message : 'An error occurred'));
  }
};

export default authSlice.reducer;