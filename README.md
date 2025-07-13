# RDS Database CRUD Tester with Profile Photos

A comprehensive web application for testing AWS RDS database CRUD operations with profile photo upload functionality using AWS S3.

## Features

- ✅ **User Management**: Create, Read, Update, Delete users
- ✅ **Profile Photos**: Upload and manage profile photos stored in S3
- ✅ **Real-time Statistics**: View user counts, average age, and recent users
- ✅ **Database Health Monitoring**: Check database connection status
- ✅ **Responsive Design**: Modern, mobile-friendly interface
- ✅ **File Validation**: Image file type and size validation
- ✅ **Automatic Cleanup**: Old photos are automatically deleted when replaced

## Prerequisites

- Node.js (v14 or higher)
- MySQL database (AWS RDS or local)
- AWS S3 bucket
- AWS IAM user with S3 permissions

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd rds-test
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   # Database Configuration
   DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
   DB_PORT=3306
   DB_USER=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=your_database_name

   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your-s3-bucket-name

   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

## AWS S3 Setup

### 1. Create S3 Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Choose a unique bucket name
4. Select your preferred region
5. Configure bucket settings (recommended: enable versioning for safety)
6. Set bucket permissions (recommended: block all public access for security)

### 2. Configure CORS (Cross-Origin Resource Sharing)

Add this CORS configuration to your S3 bucket:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 3. Create IAM User

1. Go to AWS IAM Console
2. Create a new user with programmatic access
3. Attach the following policy (or create a custom one):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

4. Save the Access Key ID and Secret Access Key

### 4. Database Setup

The application will automatically create the required table with the following schema:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INT,
    profile_photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Running the Application

1. **Start the server**

   ```bash
   npm start
   ```

2. **For development (with auto-restart)**

   ```bash
   npm run dev
   ```

3. **Access the application**
   - Web Interface: http://localhost:3000
   - API Endpoints: http://localhost:3000/api

## API Endpoints

### User Management

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Profile Photos

- `POST /api/users/:id/photo` - Upload profile photo
- `DELETE /api/users/:id/photo` - Delete profile photo

### Health Check

- `GET /api/health` - Check database connection status

## File Upload Features

### Supported Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### File Size Limits

- Maximum file size: 5MB
- Automatic file type validation
- Unique filename generation with timestamps

### Storage Structure

Files are stored in S3 with the following structure:

```
your-bucket/
└── profile-photos/
    ├── 1703123456789-uuid1.jpg
    ├── 1703123456790-uuid2.png
    └── ...
```

## Security Features

- ✅ File type validation (images only)
- ✅ File size limits
- ✅ Unique filename generation
- ✅ Automatic cleanup of old files
- ✅ CORS configuration
- ✅ IAM-based access control

## Troubleshooting

### Common Issues

1. **Database Connection Failed**

   - Check your RDS endpoint and credentials
   - Ensure your RDS instance is publicly accessible
   - Verify security group settings

2. **S3 Upload Failed**

   - Verify AWS credentials in `.env`
   - Check S3 bucket name and region
   - Ensure IAM user has proper permissions
   - Verify CORS configuration

3. **File Upload Errors**
   - Check file size (max 5MB)
   - Ensure file is an image format
   - Verify network connectivity

### Debug Mode

Set `NODE_ENV=development` in your `.env` file to see detailed error messages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review AWS documentation
3. Open an issue on GitHub
