const BASE_URL = 'http://localhost:8000/api';

export interface Subscription {
    id: string;
    is_active: boolean;
    activated_at: string;
    expires_at: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    phone_number: string | null;
    logo: string | null;
    subscription: Subscription | null;
    created_at: string;
}

export interface UserResponse {
    data: User;
}


export interface Car {
    id?: string;
    title: string;
    description: string;
    type: string;
    model: string;
    manufacture_year: number;
    listing_type: 'sale' | 'rent' | 'both';
    sale_price: number | null;
    daily_rent_price: number | null;
    weekly_rent_price?: number | null;
    monthly_rent_price?: number | null;
    pricing?: {
        sale_price: string | number | null;
        daily_rent_price: string | number | null;
        weekly_rent_price: string | number | null;
        monthly_rent_price: string | number | null;
    };
    images?: string[];
    additional_features?: string[];
    created_at?: string;
}

export interface CarouselItem {
    id?: string;
    title: string;
    image: string;
    link?: string | null;
    is_active?: boolean;
    order_position?: number;
    created_at?: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    user?: User;
}

const getHeaders = (isMultipart = false) => {
    const headers: HeadersInit = {
        'Accept': 'application/json',
    };

    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }

    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

const getUserId = (): string => {
    return localStorage.getItem('user-id') ?? ''
};


const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }
    // Some endpoints (like DELETE) might return 204 No Content
    if (response.status === 204) return null;
    return response.json();
};

export const api = {
    // --- Auth ---
    register: async (data: { name: string; email: string; password: string; password_confirmation: string }) => {
        const response = await fetch(`${BASE_URL}/register`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        return handleResponse(response);
    },

    login: async (data: { email: string; password: string }) => {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data),
        });
        const result = await handleResponse(response) as AuthResponse;
        if (result.access_token) {
            localStorage.setItem('token', result.access_token);
            // Store user data if available
            if (result.user) {
                localStorage.setItem('user', JSON.stringify(result.user));
            }
        }
        return result;
    },

    getProfile: async () => {
        const response = await fetch(`${BASE_URL}/profile`, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    getUser: async () => {
        const response = await fetch(`${BASE_URL}/user`, {
            method: 'GET',
            headers: getHeaders(),
        });
        const result = await handleResponse(response) as UserResponse;
        console.log('User Profile:', result.data);
        return result;
    },

    getPublicProfile: async (userId: string) => {
        const response = await fetch(`${BASE_URL}/users/${userId}/public-profile`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });
        return handleResponse(response);
    },

    logout: async () => {
        const response = await fetch(`${BASE_URL}/logout`, {
            method: 'POST',
            headers: getHeaders(),
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return handleResponse(response);
    },

    // --- Cars ---
    getCars: async (userId?: string) => {
        const id = userId || getUserId();
        const response = await fetch(`${BASE_URL}/users/${id}/cars`, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    createCar: async (data: Car | FormData) => {
        const isFormData = data instanceof FormData;
        const response = await fetch(`${BASE_URL}/cars`, {
            method: 'POST',
            headers: getHeaders(isFormData),
            body: isFormData ? data : JSON.stringify(data),
        });
        return handleResponse(response);
    },

    getCar: async (id: number | string) => {
        const response = await fetch(`${BASE_URL}/cars/${id}`, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    updateCar: async (id: number | string, data: Partial<Car> | FormData) => {
        const isFormData = data instanceof FormData;
        const response = await fetch(`${BASE_URL}/cars/${id}`, {
            method: 'POST', // Usually PUT, but FormData handling in some backends (like Laravel) often requires POST with _method=PUT
            headers: getHeaders(isFormData),
            body: isFormData ? data : JSON.stringify(data),
        });
        return handleResponse(response);
    },

    deleteCar: async (id: number | string) => {
        const response = await fetch(`${BASE_URL}/cars/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    // --- Carousel Items ---
    getCarouselItems: async (userId?: string) => {
        const id = userId || getUserId();
        const response = await fetch(`${BASE_URL}/users/${id}/carousel-items`, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    createCarouselItem: async (data: CarouselItem | FormData) => {
        const isFormData = data instanceof FormData;
        const response = await fetch(`${BASE_URL}/carousel-items`, {
            method: 'POST',
            headers: getHeaders(isFormData),
            body: isFormData ? data : JSON.stringify(data),
        });
        return handleResponse(response);
    },

    updateCarouselItem: async (id: number | string, data: Partial<CarouselItem> | FormData) => {
        const isFormData = data instanceof FormData;
        const response = await fetch(`${BASE_URL}/carousel-items/${id}`, {
            method: 'POST', // Using POST for potential FormData/PUT mapping
            headers: getHeaders(isFormData),
            body: isFormData ? data : JSON.stringify(data),
        });
        return handleResponse(response);
    },

    deleteCarouselItem: async (id: number | string) => {
        const response = await fetch(`${BASE_URL}/carousel-items/${id}`, {
            method: 'DELETE',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    // --- Subscription ---
    getSubscriptionStatus: async () => {
        const userId = getUserId();
        const response = await fetch(`${BASE_URL}/users/${userId}/subscription`, {
            method: 'GET',
            headers: getHeaders(),
        });
        return handleResponse(response);
    },

    // --- Upload ---
    uploadImage: async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch(`${BASE_URL}/upload`, {
            method: 'POST',
            headers: getHeaders(true),
            body: formData,
        });
        return handleResponse(response);
    },
};