import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Debug: show selected env values (no secrets)
console.log('[ENV CHECK]', {
  MAIL_FROM: process.env.MAIL_FROM,
  MAIL_TO_CONTACT: process.env.MAIL_TO_CONTACT,
  MAIL_TO_CAREERS: process.env.MAIL_TO_CAREERS,

  MOTAHIDA_MAIL_FROM: process.env.MOTAHIDA_MAIL_FROM,
  MOTAHIDA_MAIL_TO: process.env.MOTAHIDA_MAIL_TO,
  SMTP_USER: process.env.SMTP_USER
});

// Middleware
app.use(cors({
  origin: [
      'https://test.quantum-pmc.com',
      'http://www.motahida-group.com',
      'https://www.motahida-group.com',
      'https://quantum-pmc.com',
      'https://api.quantum-pmc.com',
      'http://localhost:4200'
    ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '200kb' }));

// Validation function
function validateContactData(data) {
  const errors = [];
  
  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required');
  } else if (data.name.length < 2 || data.name.length > 100) {
    errors.push('Name must be between 2 and 100 characters');
  }
  
  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email must be a valid email address');
    }
  }
  
  // Message validation
  if (!data.message || typeof data.message !== 'string') {
    errors.push('Message is required');
  } else if (data.message.length < 1 || data.message.length > 5000) {
    errors.push('Message must be between 1 and 5000 characters');
  }
  
  // Optional phone validation
  if (data.phone && typeof data.phone !== 'string') {
    errors.push('Phone must be a string');
  }
  
  // Optional subject validation
  if (data.subject && typeof data.subject !== 'string') {
    errors.push('Subject must be a string');
  }
  
  return errors;
}

// Create Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const motahida_transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.MOTAHIDA_SMTP_USER,
    pass: process.env.MOTAHIDA_SMTP_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Validation function for careers
function validateCareerData(data) {
  const errors = [];
  
  // Position validation
  if (!data.position || typeof data.position !== 'string') {
    errors.push('Position is required');
  }
  
  // Name validation
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required');
  } else if (data.name.length < 2 || data.name.length > 100) {
    errors.push('Name must be between 2 and 100 characters');
  }
  
  // Email validation
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Email must be a valid email address');
    }
  }
  
  // Phone validation
  if (!data.phone || typeof data.phone !== 'string') {
    errors.push('Phone is required');
  } else {
    const phoneRegex = /^[0-9+\-()\s]{7,}$/;
    if (!phoneRegex.test(data.phone)) {
      errors.push('Phone must be a valid phone number');
    }
  }
  
  // Subject validation
  if (!data.subject || typeof data.subject !== 'string') {
    errors.push('Subject is required');
  }
  
  // Message validation
  if (!data.message || typeof data.message !== 'string') {
    errors.push('Message is required');
  } else if (data.message.length < 10 || data.message.length > 5000) {
    errors.push('Message must be between 10 and 5000 characters');
  }
  
  // LinkedIn validation
  if (!data.linkedin || typeof data.linkedin !== 'string') {
    errors.push('LinkedIn profile is required');
  } else {
    const linkedinRegex = /^(https?:\/\/)?(www\.)?(linkedin\.com|lnkd\.in)\/.+$/;
    if (!linkedinRegex.test(data.linkedin)) {
      errors.push('LinkedIn must be a valid LinkedIn URL');
    }
  }
  
  return errors;
}

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    // Validate input data
    const validationErrors = validateContactData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        ok: false,
        error: 'validation_error',
        details: validationErrors
      });
    }
    
    const { name, email, message, subject, phone } = req.body;
    
    // Prepare email content
    const emailSubject = subject || `Contact Form Submission from ${name}`;
    const emailText = `
========================================
        CONTACT FORM SUBMISSION
========================================

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${subject ? `Subject: ${subject}` : ''}

Message:
----------------------------------------
${message}
----------------------------------------

Submitted on: ${new Date().toLocaleString()}
    `.trim();
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Contact Form Submission</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Contact Information</h3>
            <p style="margin: 8px 0;"><strong style="color: #34495e;">Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong style="color: #34495e;">Email:</strong> <a href="mailto:${email}" style="color: #3498db;">${email}</a></p>
            ${phone ? `<p style="margin: 8px 0;"><strong style="color: #34495e;">Phone:</strong> <a href="tel:${phone}" style="color: #3498db;">${phone}</a></p>` : ''}
            ${subject ? `<p style="margin: 8px 0;"><strong style="color: #34495e;">Subject:</strong> ${subject}</p>` : ''}
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Message</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; border-radius: 4px;">
              <p style="margin: 0; line-height: 1.6; color: #2c3e50;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d; font-size: 12px;">
            <p>Submitted on: ${new Date().toLocaleString()}</p>
            <p>Quantum PMC LLC - Contact Form</p>
          </div>
        </div>
      </div>
    `;
    
    // Send email to info@quantum-pmc.com
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO_CONTACT, // Contact form emails go to info@quantum-pmc.com
      replyTo: email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      envelope: {
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_TO_CONTACT
      }
    });
    
    res.json({
      ok: true,
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(502).json({
      ok: false,
      error: 'send_error'
    });
  }
});

// Motahida Group contact form endpoint
app.post('/api/motahida-contact', async (req, res) => {
  try {
    const validationErrors = validateContactData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({ ok: false, error: 'validation_error', details: validationErrors });
    }

    const { name, email, message, subject, phone } = req.body;

    // Normalize recipients from env -> array (handles spaces)
    const motahidaRecipients = (process.env.MOTAHIDA_MAIL_TO || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (motahidaRecipients.length === 0) {
      return res.status(500).json({ ok: false, error: 'config_error', details: ['MOTAHIDA_MAIL_TO is not set'] });
    }
    // Prepare email content
    const emailSubject = subject || `Motahida Group Contact Form Submission from ${name}`;
    const emailText = `
========================================
        MOTAHIDA GROUP CONTACT FORM
========================================

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${subject ? `Subject: ${subject}` : ''}

Message:
----------------------------------------
${message}
----------------------------------------

Submitted on: ${new Date().toLocaleString()}
    `.trim();
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Motahida Group Contact Form</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Contact Information</h3>
            <p style="margin: 8px 0;"><strong style="color: #34495e;">Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong style="color: #34495e;">Email:</strong> <a href="mailto:${email}" style="color: #3498db;">${email}</a></p>
            ${phone ? `<p style="margin: 8px 0;"><strong style="color: #34495e;">Phone:</strong> <a href="tel:${phone}" style="color: #3498db;">${phone}</a></p>` : ''}
            ${subject ? `<p style="margin: 8px 0;"><strong style="color: #34495e;">Subject:</strong> ${subject}</p>` : ''}
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Message</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; border-radius: 4px;">
              <p style="margin: 0; line-height: 1.6; color: #2c3e50;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d; font-size: 12px;">
            <p>Submitted on: ${new Date().toLocaleString()}</p>
            <p>Motahida Group - Contact Form</p>
          </div>
        </div>
      </div>
    `;
    
    // Send email to Motahida Group
    const info = await motahida_transporter.sendMail({
      from: process.env.MOTAHIDA_MAIL_FROM,
      to: motahidaRecipients, // Motahida Group contact emails
      replyTo: email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      envelope: {
        from: process.env.MOTAHIDA_MAIL_FROM,
        to: process.env.MOTAHIDA_MAIL_TO
      }
    });
    
    res.json({
      ok: true,
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(502).json({
      ok: false,
      error: 'send_error'
    });
  }
});

// Careers form endpoint
app.post('/api/careers', async (req, res) => {
  try {
    // Validate input data
    const validationErrors = validateCareerData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        ok: false,
        error: 'validation_error',
        details: validationErrors
      });
    }
    
    const { position, name, email, phone, subject, message, linkedin } = req.body;
    
    // Map position values to readable names
    const positionNames = {
      'senior-forensic-planner': 'Senior Forensic Planner',
      'project-controls-manager': 'Project Controls Manager',
      'senior-planning-engineer': 'Senior Planning Engineer'
    };
    
    const positionName = positionNames[position] || position;
    
    // Prepare email content
    const emailSubject = `Career Application: ${positionName} - ${name}`;
    const emailText = `
========================================
        CAREER APPLICATION
========================================

Position Applied For: ${positionName}
Name: ${name}
Email: ${email}
Phone: ${phone}
Subject: ${subject}
LinkedIn: ${linkedin}

Message:
----------------------------------------
${message}
----------------------------------------

Submitted on: ${new Date().toLocaleString()}
    `.trim();
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: #e74c3c; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Career Application</h1>
        </div>
        
        <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="margin-bottom: 20px;">
            <h3 style="color: #e74c3c; border-bottom: 2px solid #e74c3c; padding-bottom: 10px;">Position Applied For</h3>
            <div style="background-color: #fdf2f2; padding: 15px; border-left: 4px solid #e74c3c; border-radius: 4px; margin-bottom: 20px;">
              <h2 style="margin: 0; color: #e74c3c; font-size: 20px;">${positionName}</h2>
            </div>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Applicant Information</h3>
            <p style="margin: 8px 0;"><strong style="color: #34495e;">Name:</strong> ${name}</p>
            <p style="margin: 8px 0;"><strong style="color: #34495e;">Email:</strong> <a href="mailto:${email}" style="color: #3498db;">${email}</a></p>
            <p style="margin: 8px 0;"><strong style="color: #34495e;">Phone:</strong> <a href="tel:${phone}" style="color: #3498db;">${phone}</a></p>
            <p style="margin: 8px 0;"><strong style="color: #34495e;">Subject:</strong> ${subject}</p>
            <p style="margin: 8px 0;"><strong style="color: #34495e;">LinkedIn:</strong> <a href="${linkedin}" target="_blank" style="color: #3498db;">View Profile</a></p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Application Message</h3>
            <div style="background-color: #f8f9fa; padding: 15px; border-left: 4px solid #3498db; border-radius: 4px;">
              <p style="margin: 0; line-height: 1.6; color: #2c3e50;">${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; color: #7f8c8d; font-size: 12px;">
            <p>Submitted on: ${new Date().toLocaleString()}</p>
            <p>Quantum PMC LLC - Career Application</p>
          </div>
        </div>
      </div>
    `;
    
    // Send email to hr@quantum-pmc.com
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: process.env.MAIL_TO_CAREERS, // Career applications go to hr@quantum-pmc.com
      replyTo: email,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      envelope: {
        from: process.env.MAIL_FROM,
        to: process.env.MAIL_TO_CAREERS
      }
    });
    
    res.json({
      ok: true,
      messageId: info.messageId
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(502).json({
      ok: false,
      error: 'send_error'
    });
  }
});

// Verify SMTP connection on startup
  transporter.verify((error, success) => {
    if (error) {
      console.log('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to take our messages');
    }
  });
  motahida_transporter.verify((error, success) => {
    if (error) {
      console.log('MOTAHIDA SMTP connection error:', error);
    } else {
      console.log('MOTAHIDA SMTP server is ready to take our messages');
    }
  });
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
