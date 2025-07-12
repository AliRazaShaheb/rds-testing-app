# RDS Database CRUD Tester

A complete JavaScript application for testing AWS RDS database operations with full CRUD (Create, Read, Update, Delete) functionality.

## Features

- ✅ **Full CRUD Operations**: Create, Read, Update, and Delete users
- 🌐 **Modern Web Interface**: Beautiful, responsive UI for easy testing
- 🔌 **Database Connection Pooling**: Efficient connection management
- 📊 **Real-time Statistics**: View user counts and analytics
- 🏥 **Health Monitoring**: Database connection status monitoring
- 🔒 **Input Validation**: Proper validation and error handling
- 📱 **Mobile Responsive**: Works on all device sizes

## Prerequisites

- Node.js (v14 or higher)
- MySQL RDS instance (or any MySQL database)
- npm or yarn package manager

## Quick Start

### 1. Clone and Install

```bash
# Install dependencies
npm install
```

### 2. Configure Database

Copy the environment example file and update with your RDS credentials:

```bash
cp env.example .env
```

Edit `.env` file with your RDS configuration:

```env
# RDS Database Configuration
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 3. Start the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 4. Access the Application

- **Web Interface**: http://localhost:3000
- **API Endpoints**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/api/health

## API Endpoints

### Users API

| Method | Endpoint         | Description     |
| ------ | ---------------- | --------------- |
| GET    | `/api/users`     | Get all users   |
| GET    | `/api/users/:id` | Get user by ID  |
| POST   | `/api/users`     | Create new user |
| PUT    | `/api/users/:id` | Update user     |
| DELETE | `/api/users/:id` | Delete user     |

### Health Check

| Method | Endpoint      | Description                      |
| ------ | ------------- | -------------------------------- |
| GET    | `/api/health` | Check server and database status |

## Database Schema

The application automatically creates a `users` table with the following structure:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  age INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Usage Examples

### Create a User

```javascript
const response = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    age: 30,
  }),
});
```

### Get All Users

```javascript
const response = await fetch("/api/users");
const users = await response.json();
```

### Update a User

```javascript
const response = await fetch("/api/users/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "John Smith",
    age: 31,
  }),
});
```

### Delete a User

```javascript
const response = await fetch("/api/users/1", {
  method: "DELETE",
});
```

## Web Interface Features

### Dashboard

- Real-time database connection status
- User statistics (total users, average age, recent users)
- Quick refresh functionality

### Create User Form

- Input validation for required fields
- Email uniqueness checking
- Optional age field

### Update User Form

- Pre-populate form with existing user data
- Partial updates (only update provided fields)
- Email uniqueness validation

### Users Table

- Sortable user list
- Inline edit and delete actions
- Responsive design for mobile devices

## Troubleshooting

### Database Connection Issues

1. **Check RDS Security Groups**: Ensure your RDS instance allows connections from your IP
2. **Verify Credentials**: Double-check username, password, and database name
3. **Network Connectivity**: Test connection from your local machine
4. **SSL Configuration**: Some RDS instances require SSL connections

### Common Error Messages

- `ECONNREFUSED`: Database server is not accessible
- `ER_ACCESS_DENIED_ERROR`: Invalid username or password
- `ER_BAD_DB_ERROR`: Database does not exist
- `ER_DUP_ENTRY`: Email already exists (for unique constraints)

### Development Tips

- Use `npm run dev` for development with auto-reload
- Check the console for detailed error messages
- Use the health check endpoint to verify database connectivity
- Monitor the browser's developer tools for API request/response details

## Security Considerations

- Never commit `.env` files to version control
- Use environment variables for sensitive configuration
- Implement proper authentication for production use
- Consider using AWS IAM roles for RDS access
- Enable SSL connections for production databases

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for your own RDS testing needs!

## Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Review the console logs for error details
3. Verify your RDS configuration
4. Test database connectivity manually

---

**Happy RDS Testing! 🚀**
