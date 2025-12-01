export interface Car {
    id: string;
    created_at: string;
    title: string;
    description: string;
    year: number;
    category: string;
    extra_features: string[];
    color: string;
    renting_type: 'rent' | 'sell' | 'both';
    rent_price_daily?: number;
    rent_price_weekly?: number;
    rent_price_monthly?: number;
    rent_price_yearly?: number;
    sell_price?: number;
    images: string[];
}

export type CarFilter = {
    category?: string;
    year?: number;
    minPrice?: number;
    maxPrice?: number;
    type?: 'rent' | 'sell' | 'both';
    color?: string;
}

export interface CarouselAd {
    id: string;
    created_at: string;
    title: string;
    image_url: string;
    link_url?: string;
    order_position: number;
    is_active: boolean;
}
