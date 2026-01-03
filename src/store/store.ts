import { configureStore } from '@reduxjs/toolkit';
import carsReducer from '../features/cars/carsSlice';
import authReducer from '../features/auth/authSlice';
import mainReducer from '../features/main/mainSlice';

export const store = configureStore({
    reducer: {
        main: mainReducer,
        cars: carsReducer,
        auth: authReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
