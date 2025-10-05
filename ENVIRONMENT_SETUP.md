# Environment Variables Setup

## Required Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# SMTP Configuration (Private Email)
SMTP_HOST=mail.privateemail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@quantum-pmc.com
SMTP_PASS=your-private-email-password

# Quantum PMC Email Configuration
MAIL_FROM=your-email@quantum-pmc.com
MAIL_TO_CONTACT=info@quantum-pmc.com
MAIL_TO_CAREERS=hr@quantum-pmc.com

# Motahida Group Email Configuration
MOTAHIDA_MAIL_FROM=your-email@quantum-pmc.com
MOTAHIDA_MAIL_TO=info@motahida-group.com

# Server Configuration
PORT=8080
NODE_ENV=production
```

## Email Routing

### Quantum PMC Forms:

- **Contact Form** (`/api/contact`) → `info@quantum-pmc.com`
- **Career Applications** (`/api/careers`) → `hr@quantum-pmc.com`

### Motahida Group Forms:

- **Contact Form** (`/api/motahida-contact`) → `info@motahida-group.com`

## API Endpoints

1. **Health Check**: `GET /health`
2. **Quantum PMC Contact**: `POST /api/contact`
3. **Quantum PMC Careers**: `POST /api/careers`
4. **Motahida Group Contact**: `POST /api/motahida-contact`

## Frontend Integration

For Motahida Group website, use:

```typescript
// API endpoint for Motahida Group contact form
const apiUrl = "https://api.quantum-pmc.com/api/motahida-contact";

// Form data structure
const formData = {
  name: string,
  email: string,
  message: string,
  subject: string,
  phone: string,
};
```
