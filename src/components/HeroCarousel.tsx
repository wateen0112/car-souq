import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { CarouselItem } from '../../api';

interface HeroCarouselProps {
    ads: CarouselItem[];
}

const HeroCarousel = ({ ads }: HeroCarouselProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Filter only active ads and sort by order_position
    const activeAds = ads
        .filter(ad => ad.is_active !== false)
        .sort((a, b) => (a.order_position || 0) - (b.order_position || 0));

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying || activeAds.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % activeAds.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlaying, activeAds.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
        setIsAutoPlaying(false);
        setTimeout(() => setIsAutoPlaying(true), 10000); // Resume auto-play after 10 seconds
    };

    const goToPrevious = () => {
        const newIndex = currentIndex === 0 ? activeAds.length - 1 : currentIndex - 1;
        goToSlide(newIndex);
    };

    const goToNext = () => {
        const newIndex = (currentIndex + 1) % activeAds.length;
        goToSlide(newIndex);
    };

    const handleAdClick = (ad: CarouselItem) => {
        if (ad.link) {
            // Check if it's an external link
            if (ad.link.startsWith('http://') || ad.link.startsWith('https://')) {
                window.open(ad.link, '_blank', 'noopener,noreferrer');
            } else {
                // Internal link - navigate using router
                window.location.href = ad.link;
            }
        }
    };

    if (activeAds.length === 0) {
        return null; // Don't render anything if there are no active ads
    }

    return (
        <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg mb-8 group">
            {/* Slides */}
            <div className="relative w-full h-full">
                {activeAds.map((ad, index) => (
                    <div
                        key={ad.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        <div
                            onClick={() => handleAdClick(ad)}
                            className={`relative w-full h-full ${ad.link ? 'cursor-pointer' : ''}`}
                        >
                            {/* Image */}
                            <img
                                src={ad.image}
                                alt={ad.title}
                                className="w-full h-full object-cover"
                            />

                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                            {/* Title */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <h3 className="text-2xl md:text-3xl font-bold drop-shadow-lg">
                                    {ad.title}
                                </h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {activeAds.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 md:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
                        aria-label="Previous slide"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </button>

                    <button
                        onClick={goToNext}
                        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 md:p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 z-20"
                        aria-label="Next slide"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {activeAds.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                    {activeAds.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`transition-all duration-300 rounded-full ${index === currentIndex
                                ? 'bg-white w-8 h-2'
                                : 'bg-white/50 hover:bg-white/75 w-2 h-2'
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Loading State for Single Image */}
            {activeAds.length === 1 && (
                <div
                    onClick={() => handleAdClick(activeAds[0])}
                    className={`relative w-full h-full ${activeAds[0].link ? 'cursor-pointer' : ''}`}
                >
                    <img
                        src={activeAds[0].image}
                        alt={activeAds[0].title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                        <h3 className="text-2xl md:text-3xl font-bold drop-shadow-lg">
                            {activeAds[0].title}
                        </h3>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HeroCarousel;
