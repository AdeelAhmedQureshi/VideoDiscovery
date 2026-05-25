# Backend Updates - VideoDiscovery

## Recent Changes

### 1. Video Schema Updates

- **intelligent_query** is now **required** when creating a video
- Added **VideoUpdate** schema where intelligent_query is optional for updates
- Updated VideoResponse to enforce intelligent_query as a required field

### 2. Password Security ✅

- Passwords are automatically **hashed using bcrypt** before saving to database
- Password hashing is implemented in `utils/password_hasher.py`
- Used in `services/auth_service.py` for both signup and password reset

### 3. Forgot Password Feature

New endpoints added to handle password reset:

#### POST `/api/users/forgot-password`

Request a password reset link

```json
{
  "email": "user@example.com"
}
```

#### POST `/api/users/reset-password`

Reset password using token from email

```json
{
  "token": "reset_token_from_email",
  "new_password": "new_secure_password"
}
```

**Features:**

- Generates secure reset tokens (valid for 1 hour)
- Sends email with reset link to user
- Tokens are stored in MongoDB and can only be used once
- Email service configured in `services/email_service.py`

### 4. Cloudinary Integration

Full video storage and retrieval service configured with your credentials:

**Credentials (from config.py):**

- Cloud Name: `dgztjaiuy`
- API Key: `192341468861746`
- API Secret: `ptsMoam6oKFaHvlpmVAACh5aO6o`

**CloudinaryService Methods:**

- `upload_video(file, user_id)` - Upload video with automatic optimization
- `get_video_url(public_id, transformations)` - Get optimized video URL
- `get_thumbnail_url(public_id, width, height)` - Generate video thumbnail
- `delete_video(public_id)` - Delete video from Cloudinary
- `get_video_info(public_id)` - Get video metadata

**Features:**

- Automatic video optimization (quality: auto, format: auto)
- Video deduplication using SHA-256 hash
- Organized folder structure: `videodiscovery/users/{user_id}/`
- Thumbnail generation
- Fast retrieval with Cloudinary CDN

## Environment Variables

Update your `.env` file with the following (see `.env.example`):

```env
# Cloudinary (Pre-configured)
CLOUDINARY_CLOUD_NAME=dgztjaiuy
CLOUDINARY_API_KEY=192341468861746
CLOUDINARY_API_SECRET=ptsMoam6oKFaHvlpmVAACh5aO6o
CLOUDINARY_URL=cloudinary://192341468861746:ptsMoam6oKFaHvlpmVAACh5aO6o@dgztjaiuy

# Email Configuration (Required for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:5173
```

## Database Collections

New collection added:

- **password_reset_tokens** - Stores password reset tokens with expiration

## Files Created/Modified

### New Files:

- `services/email_service.py` - Email service for sending password reset emails
- `.env.example` - Environment variables template

### Modified Files:

- `schemas/video_schema.py` - Added VideoUpdate, made intelligent_query required
- `schemas/user_schema.py` - Added ForgotPassword and ResetPassword schemas
- `services/auth_service.py` - Added forgot_password and reset_password methods
- `services/cloudinary_service.py` - Complete implementation with all methods
- `routes/user_routes.py` - Added forgot-password and reset-password endpoints
- `config.py` - Added Cloudinary and email configuration

## Testing the New Features

### Test Cloudinary Upload:

```python
from app.services.cloudinary_service import CloudinaryService

# Upload video
result = await CloudinaryService.upload_video(file, user_id)
print(result["url"])  # Cloudinary URL

# Get optimized URL
url = CloudinaryService.get_video_url(result["public_id"])

# Get thumbnail
thumb = CloudinaryService.get_thumbnail_url(result["public_id"])
```

### Test Password Reset Flow:

1. User requests reset: POST `/api/users/forgot-password`
2. User receives email with reset link
3. User clicks link (frontend redirects to reset page)
4. User submits new password: POST `/api/users/reset-password`

## Notes

- All passwords are automatically hashed before database storage
- Reset tokens expire after 1 hour
- Cloudinary is configured for automatic video optimization
- Email service requires SMTP credentials in .env file
