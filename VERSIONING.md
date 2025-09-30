# Version Management Guide

## Semantic Versioning

Nexus Uploader follows [Semantic Versioning](https://semver.org/) (SemVer):

- **MAJOR.MINOR.PATCH** (e.g., 1.3.0)
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

## Current Versions

| Package | Version | Status |
|---------|---------|--------|
| `nexus-uploader` | 1.3.1 | ✅ Published |
| `nexus-uploader-core` | 1.3.1 | ✅ Published |
| `nexus-uploader-react` | 1.3.1 | ✅ Published |

## Version Update Process

### For Bug Fixes (Patch Release)
```bash
# Update versions in all package.json files
# Example: 1.3.0 → 1.3.1

# Then publish
npm run build
npm publish  # main package
cd packages/core && npm publish
cd ../react && npm publish
```

### For New Features (Minor Release)
```bash
# Update versions in all package.json files
# Example: 1.3.0 → 1.4.0

# Then publish
npm run build
npm publish  # main package
cd packages/core && npm publish
cd ../react && npm publish
```

### For Breaking Changes (Major Release)
```bash
# Update versions in all package.json files
# Example: 1.3.0 → 2.0.0

# Then publish
npm run build
npm publish  # main package
cd packages/core && npm publish
cd ../react && npm publish
```

## Publishing Checklist

- [ ] Run all tests: `npm test`
- [ ] Build all packages: `npm run build`
- [ ] Update version numbers in all `package.json` files
- [ ] Update CHANGELOG.md with new features/fixes
- [ ] Commit changes with proper message
- [ ] Tag release: `git tag v1.3.1`
- [ ] Push tags: `git push --tags`
- [ ] Publish main package: `npm publish`
- [ ] Publish core package: `cd packages/core && npm publish`
- [ ] Publish react package: `cd packages/react && npm publish`
- [ ] Create GitHub release with changelog

## Pre-release Versions

For beta/testing versions:
- `1.4.0-beta.1`
- `1.4.0-rc.1` (release candidate)

```bash
npm publish --tag beta  # for beta releases
npm publish --tag latest  # for stable releases
```

## Emergency Patches

For critical security fixes:
1. Create hotfix branch from last stable tag
2. Fix the issue
3. Update patch version (e.g., 1.3.0 → 1.3.1)
4. Publish immediately
5. Merge back to main branch