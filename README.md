# Quantum PMC Backend

Node.js backend for contact form and career application submissions.

## Quick Start

1. **Install dependencies:**

```bash
npm install
```

2. **Configure environment:**
   Create `.env` file with your SMTP settings:

```env
PORT=4000
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
MAIL_FROM="your-email@gmail.com"
MAIL_TO=recipient@yourdomain.com
```

3. **Start server:**

```bash
npm start
```

## API Endpoints

- `GET /health` - Health check
- `POST /api/contact` - Contact form submission
- `POST /api/careers` - Career application submission

## Production Deployment

```bash
npm install -g pm2
npm run prod
```

## Scripts

- `npm start` - Start server
- `npm run prod` - Start with PM2
- `npm run stop` - Stop PM2 process
- `npm run restart` - Restart PM2 process
- `npm run logs` - View logs
