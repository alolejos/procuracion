import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const loginUser = createAsyncThunk(
  'user/login',
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:3006/api/auth/login', {
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
        id: data.user.id,
        token: data.token,
        username: data.user.username,
        name: data.user.name,
        surname: data.user.surname,
        sectorId: data.user.sectorId,
        alerts: data.user.alerts
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  id: null,
  username: null,
  token: null,
  name: null,
  surname: null,
  sectorId: null,
  loading: false,
  error: null,
  alerts: 0
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
    updateUser: (state, action) => {
      state.name = action.payload.name;
      state.surname = action.payload.surname;
      state.sectorId = action.payload.sectorId;
      state.id = action.payload.id;
    },
    updateAlerts: (state, action) => {
      state.alerts = action.payload;
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
        state.sectorId = action.payload.sectorId; // Store userTypeId
        state.id = action.payload.id,
        state.alerts = action.payload.alerts
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearUser, updateUser, updateAlerts } = userSlice.actions;

export default userSlice.reducer;
