import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../../api';
import type { User } from '../../../api';

interface AuthState {
    userId: string | null;
    profile: User | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: AuthState = {
    userId: localStorage.getItem('user-id') || null,
    profile: null,
    status: 'idle',
    error: null,
};

export const fetchPublicProfile = createAsyncThunk(
    'auth/fetchPublicProfile',
    async (userId: string) => {
        const response = await api.getPublicProfile(userId);
        return response.data || response;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUserId: (state, action: PayloadAction<string | null>) => {
            state.userId = action.payload;
            if (action.payload) {
                localStorage.setItem('user-id', action.payload);
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPublicProfile.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchPublicProfile.fulfilled, (state, action: PayloadAction<User>) => {
                state.status = 'succeeded';
                state.profile = action.payload;
                console.log('Public Profile stored in Redux:', action.payload);
            })
            .addCase(fetchPublicProfile.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch public profile';
            });
    },
});

export const { setUserId } = authSlice.actions;
export default authSlice.reducer;
