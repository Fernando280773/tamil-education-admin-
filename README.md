# Tamil Education Group - Yorkshire & Lincolnshire

A comprehensive web application for the Tamil Education Group, featuring membership applications, admin panel, and educational resources management.

## 🌟 Features

- **Multilingual Support**: Tamil and English interface
- **Membership Application Form**: Complete online registration system
- **Admin Dashboard**: Manage applications, users, and content
- **Responsive Design**: Works on all devices
- **Real-time Validation**: Form validation with Tamil language feedback
- **Database Integration**: MongoDB for data storage
- **Email Notifications**: Automated email system (configurable)

## 🚀 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **Email**: Nodemailer integration
- **Security**: Express rate limiting, input validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🔧 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   NODE_ENV=production
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRE=7d
   
   # Email Configuration (Optional)
   EMAIL_ENABLED=false
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_FROM=your-email@gmail.com
   
   # Admin Configuration
   ADMIN_EMAIL=admin@tamilcommittee.org
   ADMIN_PASSWORD=admin123
   ```

4. Set up the database:
   ```bash
   node setup-admin.js
   ```

5. Start the application:
   ```bash
   npm start
   ```

## 🌐 Deployment

### Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts

### Railway Deployment
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically

### Manual Deployment
1. Upload all files except `node_modules` and `.env`
2. Run `npm install` on the server
3. Configure environment variables
4. Start with `npm start`

## 📱 Usage

### For Users
1. Visit the homepage
2. Fill out the membership application form
3. Submit and wait for admin approval

### For Admins
1. Go to `/admin` route
2. Login with admin credentials
3. Manage applications in the dashboard

## 🔐 Admin Credentials

Default admin login:
- **Email**: admin@tamilcommittee.org
- **Password**: admin123

**⚠️ Important**: Change these credentials after first login!

## 📂 Project Structure

```
tamil-education-app/
├── admin/                 # Admin panel HTML files
├── middleware/           # Authentication middleware
├── models/              # MongoDB models
├── routes/              # Express route handlers
├── utils/               # Utility functions
├── index.html           # Main application page
├── server.js            # Express server configuration
├── setup-admin.js       # Admin user setup script
└── package.json         # Project dependencies
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MongoDB URI in `.env`
   - Ensure MongoDB is running

2. **Email Not Sending**
   - Set `EMAIL_ENABLED=false` to disable emails
   - Configure proper SMTP settings

3. **Admin Login Issues**
   - Run `node setup-admin.js` to reset admin user
   - Check JWT_SECRET in environment variables

## 📞 Support

For support or questions, contact the Tamil Education Group administration.

---

© 2025 Tamil Education Group - Yorkshire & Lincolnshire. All rights reserved.
