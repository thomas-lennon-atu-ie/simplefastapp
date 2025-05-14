
# SimpleFast

SimpleFast is an intermittent fasting assistant app that helps users track their fasting periods, monitor progress, and achieve their health goals.

![SimpleApp Logo](https://github.com/thomas-lennon-atu-ie/simplefastapp/blob/main/assets/logo.png?raw=true)

## Features

-   **Smart Fasting Timer**: Track your active fasts with a beautiful, informative interface
-   **Fasting Stages**: Understand what's happening in your body during different fasting stages
-   **Custom Goals**: Choose from popular presets (16:8, 18:6, OMAD) or create custom fasting schedules
-   **Statistics**: View your fasting history and track progress over time
-   **Push Notifications**: Get notified when your fast is complete
-   **Daily Reminders**: Set custom reminders to start your fasting window
-   **Dark/Light Theme**: Comfortable viewing in any lighting condition
-   **Secure Authentication**: Sign in with email or Google account

## Technologies Used

-   **Frontend**: React Native, Expo, TypeScript
-   **Backend**: Firebase (Authentication, Firestore)
-   **Animation**: Lottie
-   **Charts**: ApexCharts
-   **Navigation**: React Navigation
-   **Push Notifications**: Expo Notifications

## Installation

### Prerequisites

-   Node.js (v19+)
-   npm or yarn
-   Expo CLI
-   Android Studio 

### Setup

1.  Clone the repository
    
    git  clone  https://github.com/thomas-lennon-atu-ie/simplefastapp.git
    
    cd  simplefastapp
    
2.  Install dependencies
    
    npm  install
    
3.  Create a  .env  file in the root directory with your Firebase configuration
    
    FIREBASE_API_KEY=your_api_key
    
    FIREBASE_AUTH_DOMAIN=your_auth_domain
    
    FIREBASE_PROJECT_ID=your_project_id
    
    FIREBASE_STORAGE_BUCKET=your_storage_bucket
    
    FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    
    FIREBASE_APP_ID=your_app_id
    
    FIREBASE_ANDROID_APP_ID=your_android_app_id
    
4.  Start the development server
    
    npm  start
    

## Build

The app can be built for different environments:

# Development build

npm  run  build:android:dev

# Staging build

npm  run  build:android:staging

# Production build

npm  run  build:android:prod

# Web build

npm  run  build:web

## Project Structure

simplefastapp/

├── assets/ # Images and animations

├── src/

│ ├── components/ # Reusable UI components

│ ├── config/ # Configuration files

│ ├── context/ # React context providers

│ ├── navigation/ # Navigation structure

│ ├── screens/ # App screens

│ ├── services/ # Service modules

│ └── types/ # TypeScript type definitions

├── .env # Environment variables (not in git but are stored as env variables on Github and Expo directly)

├── app.json # Expo configuration

├── eas.json # EAS Build configuration

├── package.json # Dependencies and scripts

└── tsconfig.json # TypeScript configuration

## Deployment

The app is deployed using Expo Application Services (EAS) with different profiles for development, staging, and production environments.

### CI/CD Pipeline

The GitHub Actions workflow handles continuous integration and deployment:

-   Lint and test on pull requests
-   Build and publish on version tags
-   Automated deployment to Firebase Hosting

## Getting Started

1.  Create an account or log in
2.  Choose a fasting goal from the presets or create a custom one
3.  Start your fast by pressing the central button
4.  Track your progress through the different fasting stages
5.  End your fast when complete
6.  View your statistics to track improvement over time

## Security

For security issues, please refer to SECURITY.md for reporting guidelines.