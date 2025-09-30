# Security Guide

## Overview

Nexus Uploader provides enterprise-grade security features to protect your application from malicious uploads and abuse.

## Features

### MIME Type Spoofing Prevention

Detects actual file content vs declared MIME type to prevent attackers from uploading malicious files disguised as safe types.

```javascript
const securityMiddleware = createSecurityMiddleware({
  validation: {
    allowedMimeTypes: ['image/*', 'application/pdf'],
    enableMimeValidation: true
  }
});
```

### Virus Scanning

Integrates with ClamAV antivirus engine to scan uploaded files for malware.

```javascript
const securityMiddleware = createSecurityMiddleware({
  validation: {
    enableVirusScan: true,
    clamAVHost: 'localhost',
    clamAVPort: 3310
  }
});
```

### Rate Limiting

Prevents abuse with configurable upload limits per IP address.

```javascript
const securityMiddleware = createSecurityMiddleware({
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 uploads per windowMs
  }
});
```

## Security Best Practices

1. **Always validate file types** on both client and server
2. **Use rate limiting** to prevent abuse
3. **Scan files for viruses** in production
4. **Store sensitive credentials securely**
5. **Use HTTPS** for all uploads
6. **Implement proper authentication** for private uploads