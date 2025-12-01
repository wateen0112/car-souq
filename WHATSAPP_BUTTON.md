# WhatsApp Floating Button

A beautiful floating WhatsApp button has been added to all pages in the car marketplace app.

## Features

✨ **Always Visible**: Fixed position floating button on all pages  
💬 **Direct Chat**: Opens WhatsApp chat with pre-filled message  
🎨 **Animated**: Pulse effect, hover animations, and smooth transitions  
📱 **Responsive**: Optimized positioning for mobile and desktop  
🌐 **RTL Support**: Works perfectly with Arabic RTL layout  
🎯 **Accessible**: Proper ARIA labels and keyboard support  

## Location

The button is positioned:
- **Mobile**: Bottom left (above the navigation bar)
- **Desktop**: Bottom left corner

## Configuration

To customize the WhatsApp number and message, edit this file:

### `src/lib/whatsappConfig.ts`

```typescript
export const WHATSAPP_CONFIG = {
  // Your WhatsApp phone number (include country code)
  phoneNumber: '+966500000000', // Change this to your number
  
  // Default message
  defaultMessage: 'مرحباً، أنا مهتم بالسيارات المعروضة في سوق السيارات',
  
  // Show notification badge
  showNotificationBadge: true, // true or false
};
```

## Phone Number Format

Make sure to use the international format:
- ✅ Correct: `+966500000000` (with country code +966 for Saudi Arabia)
- ❌ Wrong: `0500000000` (missing country code)
- ❌ Wrong: `966-50-000-0000` (has hyphens)

## Customization

### Change the Message

Edit the `defaultMessage` in `whatsappConfig.ts`:

```typescript
defaultMessage: 'Your custom message here'
```

### Hide the Notification Badge

Set `showNotificationBadge` to `false` in the config file.

### Change Colors

The button uses WhatsApp's official colors:
- Primary: `#25D366` (WhatsApp green)
- Secondary: `#128C7E` (darker green)

To change colors, edit `src/components/WhatsAppButton.tsx` and modify the `bg-gradient-to-br` classes.

## Usage on Car Details Pages

You can create car-specific WhatsApp messages using the helper function:

```typescript
import { getCarWhatsAppMessage } from '../lib/whatsappConfig';

const message = getCarWhatsAppMessage('Toyota Camry 2024', 'car-123');
// Result: "مرحباً، أنا مهتم بالسيارة: Toyota Camry 2024 (معرف: car-123)"
```

## Components

### `WhatsAppButton.tsx`
- Main button component
- Handles click events
- Animates on hover
- Shows tooltip

### `whatsappConfig.ts`
- Central configuration
- Phone number
- Default messages
- Helper functions

## Browser Compatibility

✅ Works on all modern browsers  
✅ Mobile browsers (iOS Safari, Chrome, Firefox)  
✅ Desktop browsers  
✅ Opens WhatsApp Web or WhatsApp app depending on device  

## Testing

1. Update the phone number in `whatsappConfig.ts`
2. Save the file
3. Click the floating button
4. It should open WhatsApp with your number and pre-filled message

**Note**: Make sure the phone number has WhatsApp installed!
