# Firebase Setup Guide for ANNAVAM Website

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `annavam-orders` (or any name you prefer)
4. **Disable Google Analytics** (not needed for this project)
5. Click "Create project"

## Step 2: Set up Firestore Database

1. In your Firebase project, click "Firestore Database" in the left sidebar
2. Click "Create database"
3. **Choose "Start in test mode"** (we'll secure it later)
4. Select your region (choose closest to your location)
5. Click "Done"

## Step 2.1: Set up Firebase Authentication

1. In your Firebase project, click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Click on "Email/Password"
5. **Enable** Email/Password authentication
6. Click "Save"
7. Go to "Users" tab to create your first admin account (or use the website signup)

## Step 3: Set up Firebase Hosting

1. Click "Hosting" in the left sidebar
2. Click "Get started"
3. Follow the setup steps (we'll use the web interface for now)

## Step 4: Get Firebase Configuration

1. Click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon `</>`
5. Enter app nickname: "ANNAVAM Website"
6. **Check "Also set up Firebase Hosting"**
7. Click "Register app"
8. **Copy the Firebase configuration object**

## Step 5: Configure Your Website

Open `script.js` and replace the empty `firebaseConfig` with your configuration:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC-your-actual-api-key-here",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789"
};
```

## Step 6: Deploy to Firebase Hosting

### Option A: Using Firebase CLI (Recommended)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. In your project folder: `firebase init hosting`
4. Select your Firebase project
5. Set public directory as current folder (just press Enter)
6. Configure as single-page app: **No**
7. Deploy: `firebase deploy`

### Option B: Using Web Interface
1. Go to Hosting in Firebase Console
2. Drag and drop your website files
3. Your site will be live at: `https://your-project-id.web.app`

## Step 7: Set up Custom Domain (Optional)

1. In Firebase Console, go to Hosting
2. Click "Add custom domain"
3. Enter your domain: `annavam.com`
4. Follow the DNS setup instructions
5. Point your GoDaddy domain to Firebase

## Step 8: Secure Firestore Rules

1. Go to Firestore Database
2. Click "Rules" tab
3. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to orders for everyone (for admin dashboard)
    match /orders/{document} {
      allow read: if true;
      allow write: if true; // For now - we'll improve this later
    }
  }
}
```

4. Click "Publish"

## Step 9: Test Your Website

1. Place a test order on your website
2. Check Firebase Console > Firestore Database
3. You should see the order in the "orders" collection
4. Test admin dashboard with Firebase Authentication

### **🔐 Admin Access:**
- **URL:** https://annavam-orders.web.app/#admin
- **Authentication:** Firebase Email/Password
- **Features:** 
  - Secure login with email/password
  - Forgot password functionality
  - Create new admin accounts
  - Automatic logout

## Firebase Project Structure

Your Firestore database will have:
```
orders (collection)
  └── ORDER_1234567890 (document)
      ├── id: "ORDER_1234567890"
      ├── name: "Customer Name"
      ├── whatsapp: "1234567890"
      ├── address: "Customer Address"
      ├── deliveryDate: "2024-01-15"
      ├── orderDate: "2024-01-10T10:30:00Z"
      ├── status: "pending"
      ├── instructions: "Special requests"
      ├── total: 1200
      ├── items: [
      │   {
      │     name: "Classic Milk Peda",
      │     qty: 2,
      │     price: 600
      │   }
      │ ]
      ├── createdAt: timestamp
      └── updatedAt: timestamp
```

## Your Website URLs

- **Firebase Hosting**: `https://your-project-id.web.app`
- **Custom Domain**: `https://annavam.com` (after DNS setup)
- **Admin Dashboard**: `https://annavam.com/#admin`

## Benefits of Firebase

✅ **Real-time database** - Changes sync instantly
✅ **Free hosting** with SSL certificate
✅ **Custom domain** support (free)
✅ **Automatic backups** by Google
✅ **Scalable** - handles traffic spikes
✅ **No server management** required
✅ **Professional infrastructure**

## Cost Breakdown

- **Firestore**: 50,000 reads/day FREE
- **Hosting**: 10GB storage + 360MB/day transfer FREE
- **Custom Domain**: FREE (you only pay for domain registration)
- **SSL Certificate**: FREE

## Next Steps

1. Complete the Firebase setup
2. Test order placement and admin dashboard
3. Set up custom domain with GoDaddy
4. Add Firebase Authentication for better admin security (optional)

## Support

If you need help with any step, the Firebase documentation is excellent:
- [Firebase Docs](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Hosting Guide](https://firebase.google.com/docs/hosting)
