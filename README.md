# Service Review System Backend

## Project Purpose
The Service Review System is a platform that allows users to explore services, read and post reviews, and manage their own reviews and services. This backend handles authentication, user management, service listings, review management, and more. It is designed to work with a frontend application, which allows users to interact with services and their reviews.

## Live URL
[**Service Review System Backend**](https://service-review-system-server-beta.vercel.app/) *(https://service-review-system-server-beta.vercel.app/)*

## Key Features
- **User Authentication**: Users can sign up, log in, and manage their session through JWT authentication.
- **Service Management**: Users can add, edit, delete, and view services. Each service has details like service title, description, and company.
- **Review System**: Users can submit, update, delete, and view reviews for different services.
- **Private Routes**: Certain routes are protected and require users to be authenticated (using JWT).
- **Data Fetching**: Users can view service details, featured services, and manage their reviews through REST APIs.
- **Count API**: Provides the count of services, reviews, and users in the system.

## npm Packages Used
- **express**: A fast, unopinionated, minimalist web framework for Node.js.
- **mongodb**: MongoDB driver for interacting with MongoDB databases.
- **cors**: A package to enable Cross-Origin Resource Sharing (CORS) with options.
- **jsonwebtoken**: A package for creating and verifying JSON Web Tokens (JWT).
- **cookie-parser**: A middleware for parsing cookies in HTTP requests.
- **dotenv**: A zero-dependency module for loading environment variables from a `.env` file into `process.env`.

