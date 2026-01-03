import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../../api';
import type { Car } from '../../../api';

interface CarsState {
    items: Car[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: CarsState = {
    items: [],
    status: 'idle',
    error: null,
};

export const fetchCars = createAsyncThunk('cars/fetchCars', async () => {
    const response = await api.getCars();
    // Handle potential response structures (data.data or direct array)
    const data = response.data || response;
    if (data && data.data && Array.isArray(data.data)) {
        return data.data;
    }
    if (Array.isArray(data)) {
        return data;
    }
    return [];
});

const carsSlice = createSlice({
    name: 'cars',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCars.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchCars.fulfilled, (state, action: PayloadAction<Car[]>) => {
                state.status = 'succeeded';
                state.items = action.payload;
            })
            .addCase(fetchCars.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Failed to fetch cars';
            });
    },
});

export default carsSlice.reducer;
