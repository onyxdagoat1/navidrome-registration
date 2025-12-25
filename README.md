# Navidrome Registration Service

A self-service user registration middleware for [Navidrome](https://github.com/navidrome/navidrome) music server. Enables public user registration while maintaining admin control.

## 🎯 Features
- Self-service user registration via REST API
- Automatic user creation in Navidrome via Subsonic API
- Rate limiting to prevent spam registrations
- Input validation (username, email, password strength)
- CORS support for frontend integration
- Token-based authentication with Navidrome
- 
## Prerequisites
- Node.js 14.x or higher
- Running Navidrome instance
- Navidrome admin credentials

### 1. Clone the Repository
```bash
git clone https://github.com/onyxdagoat1/navidrome-registration.git
cd navidrome-registration
```
### 2. Install Dependencies
```bash
npm install
```
### 3. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```
Edit `.env` with your settings:

```env
NAVIDROME_URL=http://localhost:4533
NAVIDROME_ADMIN_USER=admin
NAVIDROME_ADMIN_PASSWORD=your_admin_password_here
PORT=3001
FRONTEND_URL=http://localhost:3000
```
### 4. Start the Server
```bash
npm run dev
```
The server will start on `http://localhost:3001`

## API Endpoints
### Register User
**Endpoint:** `POST /api/register`
**Request Body:**
```json
{
  "username": "newuser",
  "password": "securepassword123",
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "username": "newuser"
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "error": "Username must be 3-20 characters"
}
```

### Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "message": "Registration service running",
  "navidromeUrl": "http://localhost:4533"
}
```
## Docker Deployment

Create a `docker-compose.yml`:

```yaml
version: '3'
services:
  navidrome-registration:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NAVIDROME_URL=http://navidrome:4533
      - NAVIDROME_ADMIN_USER=admin
      - NAVIDROME_ADMIN_PASSWORD=your_password
      - FRONTEND_URL=http://localhost:3000
    restart: unless-stopped
```
## Testing

### Test Registration Endpoint

```bash
curl -X POST http://localhost:3001/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass123",
    "email": "test@example.com"
  }'
```

### Test Health Check

```bash
curl http://localhost:3001/api/health
```
## License

MIT License - See [LICENSE](LICENSE) file for details
- [Navidrome](https://github.com/navidrome/navidrome) - The music server backend
- [Aonsoku](https://github.com/onyxdagoat1/aonsoku-fork) - Frontend streaming service

