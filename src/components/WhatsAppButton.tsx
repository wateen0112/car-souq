import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
    phoneNumber: string;
    message?: string;
    showBadge?: boolean;
}

const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
    phoneNumber,
    message = 'مرحباً، أنا مهتم بخدماتكم',
    showBadge = true
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    const handleClick = () => {
        // Format phone number (remove spaces, dashes, etc.)
        const cleanNumber = phoneNumber.replace(/\D/g, '');

        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message);

        // Create WhatsApp URL
        const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

        // Open in new tab
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40">
                <div className="relative">
                    {/* Tooltip */}
                    {showTooltip && (
                        <div className="absolute bottom-full left-0 mb-2 whitespace-nowrap bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg animate-fade-in">
                            تواصل معنا عبر واتساب
                            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                    )}

                    {/* Main Button */}
                    <button
                        onClick={handleClick}
                        onMouseEnter={() => {
                            setIsHovered(true);
                            setShowTooltip(true);
                        }}
                        onMouseLeave={() => {
                            setIsHovered(false);
                            setShowTooltip(false);
                        }}
                        className="group relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
                        aria-label="تواصل عبر واتساب"
                    >
                        {/* Pulse Animation */}
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping"></span>

                        {/* Icon */}
                        <MessageCircle
                            className="relative text-white transition-transform duration-300 group-hover:rotate-12"
                            size={28}
                        />

                        {/* Notification Badge (optional) */}
                        {showBadge && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold shadow-md">
                                1
                            </span>
                        )}
                    </button>

                    {/* Ripple Effect on Hover */}
                    {isHovered && (
                        <div className="absolute inset-0 rounded-full bg-[#25D366] opacity-25 animate-pulse"></div>
                    )}
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
        </>
    );
};

export default WhatsAppButton;
