import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
  'user/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://15.228.73.54:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      console.log('termina el loginuser:', data);
      // Return user data along with the token
      return {
        token: data.token,
        username: data.user.username,
        name: data.user.name,
        surname: data.user.surname,
        userTypeId: data.user.userTypeId,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  username: null,
  token: null,
  name: null,
  surname: null,
  userTypeId: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      return initialState;
    },
    clearUser: (state) => {
      localStorage.removeItem('token'); // Clear token from localStorage
      return initialState; // Reset state to initial
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('ENTRO AL FULFILLED: Login successful:', action.payload); 
        state.loading = false;
        state.username = action.payload.username;
        state.token = action.payload.token;
        state.surname = action.payload.surname;
        state.name = action.payload.name;
        state.userTypeId = action.payload.userTypeId; // Store userTypeId
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearUser } = userSlice.actions;

export default userSlice.reducer;
