# Firebase Access Code Generator

A React component that generates secure, one-time access codes and stores them in Firebase Firestore.

## Features

- Generates unique alphanumeric access codes
- Prevents duplicate code generation on page refresh
- Stores codes in Firebase Firestore with user and purchase data
- Retrieves existing codes for returning users

## Setup

1. Install the required dependencies:

```bash
npm install firebase react react-dom
```

2. Update the Firebase configuration in `firebaseConfig.js` with your project credentials.

3. Set up Firestore in your Firebase console:
   - Create a collection called `purchase_codes`
   - Set up appropriate security rules

## Usage

Import the component into your post-purchase page or funnel:

```jsx
import AccessCodeGenerator from './path/to/AccessCodeGenerator';
import './path/to/AccessCodeGenerator.css';

// Then in your component:
<AccessCodeGenerator 
  userId="user123" 
  purchaseId="order456" 
/>
```

### Required Props

- `userId`: A unique identifier for the user
- `purchaseId`: A unique identifier for the purchase/order

## How It Works

1. When the component mounts, it checks if an access code already exists for the given purchase ID
2. If a code exists, it displays the existing code
3. If no code exists, it generates a new unique code and stores it in Firebase
4. The code is displayed to the user with styling and instructions

## Security Considerations

- This implementation prevents multiple code generation on page refresh
- Make sure to set up Firestore security rules to prevent unauthorized access
- Consider adding rate limiting to prevent abuse 