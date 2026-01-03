import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface MainState {
    theme: 'light' | 'dark';
    sidebarOpen: boolean;
    loading: boolean;
}

const initialState: MainState = {
    theme: 'light',
    sidebarOpen: false,
    loading: false,
};

const mainSlice = createSlice({
    name: 'main',
    initialState,
    reducers: {
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
    },
});

export const { setTheme, toggleSidebar, setLoading } = mainSlice.actions;
export default mainSlice.reducer;
