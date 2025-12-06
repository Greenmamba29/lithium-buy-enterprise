# Contributing Guide

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Write tests
6. Submit a pull request

## Development Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Messages
Follow conventional commits:
```
feat: add supplier search functionality
fix: resolve cache invalidation issue
docs: update API documentation
refactor: simplify transaction logic
```

### Code Style
- Follow TypeScript best practices
- Use ESLint configuration
- Format with Prettier (if configured)
- Write self-documenting code

## Pull Request Process

1. **Update Documentation**
   - Update relevant docs
   - Add/update API documentation
   - Update CHANGELOG if needed

2. **Write Tests**
   - Add tests for new features
   - Ensure all tests pass
   - Maintain or improve coverage

3. **Code Review**
   - Address review comments
   - Ensure CI passes
   - Get approval from maintainers

4. **Merge**
   - Squash commits if needed
   - Delete feature branch
   - Update related issues

## Code Standards

### TypeScript
- Use strict mode
- Avoid `any` type
- Use interfaces for object shapes
- Prefer type inference where clear

### React
- Use functional components
- Prefer hooks over classes
- Keep components small and focused
- Use proper prop types

### Backend
- Use async/await
- Handle errors properly
- Log important events
- Use transactions for multi-step operations

## Questions?

- Check existing documentation
- Review similar code in codebase
- Ask in GitHub Discussions
- Open an issue for clarification
