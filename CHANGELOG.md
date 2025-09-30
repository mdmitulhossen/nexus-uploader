# Changelog

All notable changes to Nexus Uploader will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - 2025-09-30

### 📝 Documentation
- Improved GitHub links in README and CONTRIBUTING.md
- Added version management guide (VERSIONING.md)
- Added comprehensive changelog (CHANGELOG.md)
- Created GitHub issue templates for better bug reports and feature requests
- Enhanced contributing guidelines with detailed setup instructions

### 🔧 Repository
- Added professional GitHub issue templates
- Improved documentation navigation
- Better support link handling

## [1.3.0] - 2025-09-30

### 🚀 Added
- **Enterprise Security Features**
  - MIME type spoofing prevention with file-type validation
  - ClamAV virus scanning integration
  - Advanced rate limiting (upload, large file, chunked upload)
  - File size limits per type and user

- **Performance Optimization**
  - Redis and memory caching support
  - CDN integration (Cloudflare, CloudFront, Akamai, Custom)
  - Automatic cache purging on file updates
  - File URL caching for reduced API calls

- **CDN Integration**
  - URL transformation from storage to CDN URLs
  - Multiple CDN provider support
  - Cache purge automation
  - Frontend CDN URL handling

- **Documentation**
  - Complete user-friendly README
  - API reference documentation
  - Security and performance guides
  - Contributing guidelines

### 🔧 Changed
- Enhanced TypeScript support with better type definitions
- Improved error handling and logging
- Updated Jest configuration for ES modules
- Professional GitHub issue templates

### 🐛 Fixed
- ES module compatibility issues
- TypeScript compilation errors
- Test configuration problems

### 📚 Documentation
- Complete rewrite of README with examples
- Added CDN integration guide
- Created comprehensive API documentation
- Added security and performance guides

## [1.2.2] - 2025-09-15

### 🐛 Fixed
- Core package axios dependency issues
- React package TypeScript compilation
- Minor bug fixes

## [1.2.1] - 2025-09-10

### 🐛 Fixed
- Package dependency issues
- Build configuration improvements

## [1.2.0] - 2025-09-01

### 🚀 Added
- React components and hooks
- Frontend-only direct upload mode
- Progress tracking improvements
- Better error handling

### 🔧 Changed
- Improved chunked upload reliability
- Enhanced storage adapter interfaces

## [1.1.0] - 2025-08-15

### 🚀 Added
- Chunked upload support
- Multiple storage adapters (S3, GCS, Azure, Local)
- File optimization (WebP, WebM)
- Lifecycle hooks

## [1.0.0] - 2025-07-01

### 🚀 Added
- Initial release
- Express.js middleware
- Basic S3 storage support
- File upload validation
- TypeScript support

---

## Version Management

See [VERSIONING.md](./VERSIONING.md) for information about version numbering and publishing process.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.