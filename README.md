# 🚂 Railway Logistics Management System

A comprehensive web-based logistics management system designed to streamline railway transportation operations, booking management, and service coordination.

## 🌟 Features

### 🔐 Authentication & User Management
- [x] **User Registration & Login** - Secure JWT-based authentication
- [x] **Role-Based Access Control** - Admin, Staff, and User roles
- [x] **Profile Management** - User profile updates and management
- [x] **Profile Picture Upload** - Cloud-based image storage with automatic optimization
- [x] **Password Security** - Bcrypt hashing with secure password policies

### 🚄 Railway Service Management
- [x] **Service Creation** - Add new railway services with detailed information
- [x] **Route Management** - Comprehensive route planning and scheduling
- [x] **Capacity Tracking** - Real-time seat and cargo capacity monitoring
- [x] **Pricing Management** - Flexible pricing per ton/seat
- [x] **Excel Import** - Bulk service import via Excel files (Admin only)
- [x] **Service Updates** - Modify existing services and schedules

### 📅 Booking System
- [x] **Online Booking** - User-friendly booking interface
- [x] **Booking Confirmation** - Instant booking confirmations
- [x] **Booking History** - Complete user booking records
- [x] **Status Tracking** - Real-time booking status updates
- [x] **Cancellation** - Flexible booking cancellation options

### 📱 User Interface
- [x] **Responsive Design** - Mobile-first responsive interface
- [x] **Dark/Light Theme** - User preference theme switching
- [x] **Image Cropping** - Advanced profile picture cropping with touch support
- [x] **Real-time Updates** - Live data updates and notifications
- [x] **Progressive Web App** - PWA capabilities for mobile users

### 🔔 Notification System
- [x] **Real-time Notifications** - Instant booking and status updates
- [x] **Email Notifications** - Automated email alerts
- [x] **Push Notifications** - Browser push notifications
- [x] **Notification Preferences** - Customizable notification settings

### 🛡️ Security Features
- [x] **Rate Limiting** - API rate limiting for security
- [x] **Input Validation** - Comprehensive input sanitization
- [x] **CORS Protection** - Cross-origin resource sharing security
- [x] **Helmet Security** - Advanced HTTP security headers
- [x] **SQL Injection Protection** - MongoDB injection prevention
- [x] **XSS Protection** - Cross-site scripting prevention

### 📊 Data Management
- [x] **MongoDB Database** - Scalable NoSQL database
- [x] **Data Validation** - Schema-based data validation
- [x] **Backup & Recovery** - Automated data backup systems
- [x] **Data Export** - Export functionality for reports

<<<<<<< HEAD
## 🏗️ Technology Stack
=======
## 🏗️ Architecture
>>>>>>> 342d3b079e9c19fa69b28c04b659719c6c18ca76

### Frontend
- **React 18** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Responsive Design** - Mobile-first approach

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT Authentication** - Secure token-based authentication

<<<<<<< HEAD
### Storage & Deployment
- **Cloud Storage** - Cloudinary for profile pictures
- **Local Storage** - Fallback local file storage
- **Database** - MongoDB Atlas cloud database
- **Frontend Hosting** - Netlify
- **Backend Hosting** - Render

## 🔒 Security Features
=======
### Storage
- **Cloud Storage** - Cloudinary for profile pictures
- **Local Storage** - Fallback local file storage
- **Database** - MongoDB Atlas cloud database

### Deployment
- **Frontend** - Netlify hosting
- **Backend** - Render cloud hosting
- **Database** - MongoDB Atlas cloud database

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+
- MongoDB Atlas account
- Cloudinary account (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/railway-logistics.git
   cd railway-logistics
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../railway
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend environment variables
   cd backend
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Servers**
   ```bash
   # Start backend server
   cd backend
   npm run dev
   
   # Start frontend server (in new terminal)
   cd railway
   npm run dev
   ```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Services
- `GET /api/services` - Get all services
- `POST /api/services` - Create new service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### Profile
- `GET /api/profile/picture/:userId` - Get profile picture
- `POST /api/profile/upload-picture` - Upload profile picture
- `DELETE /api/profile/picture` - Delete profile picture

### Admin
- `POST /api/upload` - Excel file upload for services
- `GET /api/debug/profile-pictures` - Profile picture debugging
- `GET /api/config/test` - Configuration testing

## 🔧 Configuration

### Environment Variables
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=production

# CORS
CORS_ORIGIN=your_frontend_url

# File Upload
MAX_FILE_SIZE=5242880

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📱 Mobile Features

### Touch Support
- **Gesture Recognition** - Swipe and pinch gestures
- **Touch Cropping** - Finger-based image cropping
- **Responsive Design** - Optimized for all screen sizes
- **PWA Support** - Installable as mobile app

### Performance
- **Lazy Loading** - Images and components load on demand
- **Caching** - Intelligent browser caching
- **Optimization** - Automatic image optimization
- **CDN** - Content delivery network integration

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test:security
npm audit
```

### Frontend Testing
```bash
cd railway
npm run build
npm run preview
```

## 📦 Deployment

### Frontend (Netlify)
- Automatic deployment from main branch
- Environment variable configuration
- Custom domain support

### Backend (Render)
- Automatic deployment from main branch
- Environment variable management
- Health check monitoring
- Auto-scaling capabilities

## 🔒 Security Checklist
>>>>>>> 342d3b079e9c19fa69b28c04b659719c6c18ca76

- [x] **Authentication** - JWT-based secure authentication
- [x] **Authorization** - Role-based access control
- [x] **Input Validation** - Comprehensive input sanitization
- [x] **Rate Limiting** - API abuse prevention
- [x] **CORS Protection** - Cross-origin security
- [x] **Data Encryption** - Secure data transmission
- [x] **File Upload Security** - Safe file handling
- [x] **SQL Injection Protection** - Database security
- [x] **XSS Protection** - Cross-site scripting prevention
- [x] **CSRF Protection** - Cross-site request forgery prevention

## 📊 Performance Features

- [x] **Image Optimization** - Automatic image compression
- [x] **Lazy Loading** - On-demand content loading
- [x] **Caching** - Intelligent caching strategies
- [x] **CDN Integration** - Global content delivery
- [x] **Database Indexing** - Optimized database queries
- [x] **API Rate Limiting** - Performance protection

<<<<<<< HEAD
## 📱 Mobile Features

### Touch Support
- **Gesture Recognition** - Swipe and pinch gestures
- **Touch Cropping** - Finger-based image cropping
- **Responsive Design** - Optimized for all screen sizes
- **PWA Support** - Installable as mobile app

### Performance
- **Lazy Loading** - Images and components load on demand
- **Caching** - Intelligent browser caching
- **Optimization** - Automatic image optimization
- **CDN** - Content delivery network integration

=======
>>>>>>> 342d3b079e9c19fa69b28c04b659719c6c18ca76
## 🌐 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+
- **Mobile Browsers** - iOS Safari, Chrome Mobile

## 🤝 Contributing

<<<<<<< HEAD
We welcome contributions from the community! Please follow these guidelines:

### Before Contributing
1. **Check existing issues** - Look for open issues or feature requests
2. **Discuss changes** - Open a discussion for major changes
3. **Follow coding standards** - Maintain consistent code style

### Contribution Process
1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Make your changes** - Follow the existing code patterns
4. **Test thoroughly** - Ensure your changes work correctly
5. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
6. **Push to the branch** (`git push origin feature/AmazingFeature`)
7. **Open a Pull Request** - Provide clear description of changes

### Code Standards
- **JavaScript/React** - Use modern ES6+ syntax
- **CSS** - Follow Tailwind CSS conventions
- **Naming** - Use descriptive variable and function names
- **Comments** - Add comments for complex logic
- **Testing** - Include tests for new features

### What We're Looking For
- **Bug fixes** - Help improve stability
- **Performance improvements** - Optimize existing features
- **New features** - Add value to the system
- **Documentation** - Improve code clarity
- **Testing** - Enhance test coverage
=======
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation** - Check the API documentation
- **Issues** - Report bugs via GitHub Issues
- **Discussions** - Join community discussions
- **Email** - Contact the development team
>>>>>>> 342d3b079e9c19fa69b28c04b659719c6c18ca76

## 🗺️ Roadmap

### Phase 1 (Current)
- [x] Core booking system
- [x] User authentication
- [x] Service management
- [x] Mobile responsiveness

### Phase 2 (Planned)
- [ ] Real-time tracking
- [ ] Payment integration
- [ ] Advanced analytics
- [ ] Multi-language support

### Phase 3 (Future)
- [ ] AI-powered optimization
- [ ] IoT integration
- [ ] Blockchain verification
- [ ] Advanced reporting

<<<<<<< HEAD
## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues** - Report bugs via GitHub Issues
- **Discussions** - Join community discussions
- **Pull Requests** - Submit improvements and features

=======
>>>>>>> 342d3b079e9c19fa69b28c04b659719c6c18ca76
---

**Built with ❤️ for the Railway Logistics Industry**

<<<<<<< HEAD
*Last updated: August 2025*
=======
*Last updated: December 2024*
>>>>>>> 342d3b079e9c19fa69b28c04b659719c6c18ca76
