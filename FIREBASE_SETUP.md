# Firebase Authentication Setup Guide

## 🔥 Firebase Configuration Required

Your EduMitra app now includes a complete Firebase Authentication system with role-based access control. To get it working, you need to configure Firebase with your project credentials.

## 📋 Step 1: Firebase Console Setup

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Create a new project** or select an existing one
3. **Project name**: `EduMitra` (or your preferred name)
4. **Enable Google Analytics**: Optional

## 🔧 Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. **Enable Email/Password** authentication
3. **Optional**: Enable Google Sign-in for additional login options

## 🗄️ Step 3: Setup Firestore Database

1. Go to **Firestore Database**
2. **Create database** in test mode (you can secure it later)
3. **Choose location**: Select closest to your users

## 🔑 Step 4: Get Configuration Keys

1. Go to **Project Settings** > **General**
2. Scroll down to **Your apps** section
3. Click **Add app** > **Web** (</>) 
4. **Register app** with nickname: `EduMitra Web`
5. **Copy the configuration object**

## 📝 Step 5: Update Configuration File

Replace the placeholder values in `config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  // measurementId: "YOUR_MEASUREMENT_ID" // Optional for Google Analytics
};
```

### 🔍 Where to find each value:

- **apiKey**: Web API key from Firebase config
- **authDomain**: Usually `your-project-id.firebaseapp.com`
- **projectId**: Your Firebase project ID
- **storageBucket**: Usually `your-project-id.appspot.com`
- **messagingSenderId**: Messaging sender ID from config
- **appId**: App ID from Firebase config
- **measurementId**: (Optional) For Google Analytics

## 🛡️ Step 6: Security Rules (Recommended)

### Firestore Security Rules

Go to **Firestore Database** > **Rules** and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Only admins can read all users
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }
    
    // Auth events - only system can write, admins can read
    match /auth_events/{eventId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
      allow write: if false; // Only server-side writes
    }
  }
}
```

## 🎯 Step 7: Test Authentication

1. **Start your app**: `npm start`
2. **Navigate to**: Sign Up screen
3. **Create test accounts** with different roles:
   - Student account
   - Admin account
   - Teacher account
4. **Test sign in/out** functionality
5. **Verify role-based navigation** works

## 👥 User Roles Available

The system supports these user roles:

- **Student**: Access to lessons, quizzes, timetable, assignments
- **Teacher**: Access to course management, student progress, grading
- **Admin**: Full system access, user management, analytics
- **Parent**: View child's progress, communicate with teachers
- **Super Admin**: Complete system control and configuration

## 🔐 Authentication Features Included

### ✅ Sign Up & Sign In
- Email/password authentication
- Form validation and error handling
- Role selection during registration
- Secure password requirements

### ✅ Password Management
- Password reset via email
- Password strength indicator
- Secure password validation

### ✅ Role-Based Access Control
- Automatic navigation based on user role
- Protected routes and components
- Permission-based feature access
- Role-specific dashboards

### ✅ User Profile Management
- Complete user profile storage in Firestore
- Role-specific data fields
- Profile update functionality
- Last login tracking

### ✅ Security Features
- Authentication state persistence
- Secure token management
- Input sanitization
- Error handling and logging

## 🚀 Ready-to-Use Components

### Authentication Screens
- `app/auth/signin.tsx` - Sign in screen
- `app/auth/signup.tsx` - Sign up screen  
- `app/auth/forgot-password.tsx` - Password reset

### Role-Based Dashboards
- `components/dashboard/AdminDashboard.tsx` - Admin interface
- `components/dashboard/StudentDashboard.tsx` - Student interface

### Authentication Context
- `contexts/AuthContext.tsx` - Global auth state management
- `services/authService.tsx` - Firebase auth operations
- `components/auth/AuthGuard.tsx` - Route protection

## 🔧 Customization Options

### Adding New Roles
1. Update `types/auth.ts` - Add new role to `UserRole` type
2. Update `services/authService.ts` - Add role validation
3. Create role-specific dashboard component
4. Update navigation logic in `components/auth/AuthGuard.tsx`

### Custom User Fields
1. Update `types/auth.ts` - Add fields to appropriate data interfaces
2. Update sign-up form in `app/auth/signup.tsx`
3. Update validation in `utils/validation.ts`

### Additional Authentication Methods
1. Enable in Firebase Console (Google, Facebook, etc.)
2. Install additional Firebase packages
3. Update `services/authService.ts` with new methods

## 🐛 Troubleshooting

### Common Issues

1. **"Firebase not configured"**
   - Check that you've updated `config/firebase.ts` with your keys
   - Ensure all required fields are filled

2. **"Permission denied"**
   - Check Firestore security rules
   - Verify user has correct role permissions

3. **"Network error"**
   - Check internet connection
   - Verify Firebase project is active

4. **"Invalid email/password"**
   - Check form validation
   - Verify Firebase Auth is enabled

### Debug Mode
Enable debug logging by adding to your app:
```typescript
// In development only
if (__DEV__) {
  console.log('Auth state:', authState);
}
```

## 📞 Support

If you encounter issues:
1. Check the browser/device console for error messages
2. Verify Firebase configuration is correct
3. Test with Firebase Auth emulator for development
4. Check Firestore rules and permissions

---

**🎉 Your Firebase Authentication system is now ready!**

The app will automatically redirect users to appropriate dashboards based on their roles, handle authentication state, and provide a secure, scalable authentication system for your EduMitra application.
