// WhatsApp Configuration
// Update this file to customize your WhatsApp contact settings

export const WHATSAPP_CONFIG = {
    // Your WhatsApp phone number (include country code, e.g., +966 for Saudi Arabia)
    // Format: +[country code][number] (no spaces or special characters except +)
    phoneNumber: '+966500000000', // Replace with your actual WhatsApp number

    // Default message when user clicks the WhatsApp button
    defaultMessage: 'مرحباً، أنا مهتم بالسيارات المعروضة في سوق السيارات',

    // Show notification badge (1 = show, 0 = hide)
    showNotificationBadge: true,
};

// Helper function to format car-specific WhatsApp message
export const getCarWhatsAppMessage = (carTitle: string, carId: string) => {
    return `مرحباً، أنا مهتم بالسيارة: ${carTitle} (معرف: ${carId})`;
};
