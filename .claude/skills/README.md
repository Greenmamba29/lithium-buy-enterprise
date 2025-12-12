# Claude Code Skills for LithiumBuy Enterprise

This directory contains specialized Claude Code skills for build optimization and development workflows.

## What Are Skills?

Skills are reusable workflows that Claude can invoke to perform complex, multi-step tasks. Each skill is a markdown file that describes:
- What the skill does
- When to use it
- Step-by-step execution plan
- Success criteria
- Related documentation

## Available Skills

### Build Optimization Skills

#### 1. `build-optimize.md`
**Purpose**: Optimize the build process for better performance and smaller bundle sizes.

**When to use:**
- Initial bundle size > 400 KB gzipped
- Slow build times
- After adding new dependencies
- Before major releases

**What it does:**
1. Analyzes current build configuration
2. Identifies optimization opportunities
3. Recommends specific improvements
4. Can apply optimizations with user approval

**Example invocation:**
```
"Optimize the build, focusing on reducing bundle size"
```

---

#### 2. `build-analyze.md`
**Purpose**: Analyze production build and provide detailed insights.

**When to use:**
- After any build configuration changes
- To understand bundle composition
- To identify large dependencies
- Regular performance audits

**What it does:**
1. Measures build time and bundle sizes
2. Breaks down each chunk
3. Analyzes dependencies
4. Evaluates code splitting effectiveness
5. Generates visual reports

**Example invocation:**
```
"Analyze the production build and show me what's taking up space"
```

---

#### 3. `build-test.md`
**Purpose**: Test production build locally before deployment.

**When to use:**
- Before every deployment
- After significant changes
- To catch production-only issues
- In CI/CD pipelines

**What it does:**
1. Runs clean production build
2. Starts production server
3. Tests all routes
4. Validates API endpoints
5. Checks for errors
6. Measures performance

**Example invocation:**
```
"Test the production build and make sure everything works"
```

---

#### 4. `build-clean.md`
**Purpose**: Clean build artifacts and caches.

**When to use:**
- Build errors persist
- Cache seems stale
- Before fresh build
- Disk space issues

**What it does:**
1. Removes build output
2. Clears Vite cache
3. Removes TypeScript cache
4. Cleans ESLint cache
5. Optional: Deep clean with reinstall

**Example invocation:**
```
"Clean all build artifacts and caches"
```

## Skill Usage Patterns

### Sequential Workflow
```
1. "Clean all build artifacts"               → build-clean.md
2. "Optimize the build configuration"        → build-optimize.md
3. "Build and analyze the bundle"            → build-analyze.md
4. "Test the production build"               → build-test.md
```

### Investigation Workflow
```
1. "Why is my bundle so large?"              → build-analyze.md
2. "Optimize based on the analysis"          → build-optimize.md
3. "Test that optimizations worked"          → build-test.md
```

### Troubleshooting Workflow
```
1. "Clean the build (I'm having issues)"     → build-clean.md (deep)
2. "Build and test everything works"         → build-test.md
```

### Pre-deployment Workflow
```
1. "Clean the build artifacts"               → build-clean.md (quick)
2. "Run production build tests"              → build-test.md
3. "Analyze the final bundle"                → build-analyze.md
```

## How to Invoke Skills

### Via Natural Language
Claude automatically recognizes when to use these skills based on your request:

**Examples:**
- "Optimize my build" → Invokes `build-optimize.md`
- "Analyze the production bundle" → Invokes `build-analyze.md`
- "Test the build before deploying" → Invokes `build-test.md`
- "Clean everything and rebuild" → Invokes `build-clean.md` then rebuilds

### Via Direct Reference
You can explicitly request a skill:

**Examples:**
- "Use the build-optimize skill"
- "Run the build-analyze skill and show detailed results"
- "Execute build-test skill with full test suite"

### Via Workflow Description
Describe the workflow and Claude will chain skills:

**Examples:**
- "Clean, optimize, and test my build" → Chains 3 skills
- "I need to reduce bundle size - analyze and fix it" → Chains 2 skills
- "Prepare for production deployment" → Chains 3 skills (clean, test, analyze)

## Skill Configuration

### Environment Variables
Some skills may require environment variables:
```env
ANALYZE=true                    # Enable bundle analysis
NODE_OPTIONS=--max-old-space-size=4096  # Increase heap for large builds
```

### Tool Requirements
Ensure these tools are installed:
```bash
# Required (already in package.json)
- vite
- esbuild
- typescript

# Optional (for enhanced analysis)
npm install -D rollup-plugin-visualizer source-map-explorer size-limit
```

## Creating New Skills

### Skill Template
```markdown
# [Skill Name] Skill

## What This Skill Does
[Brief description]

## Usage
[When to use this skill]

## Steps
1. Step 1
2. Step 2
3. ...

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Related Skills
- Related skill 1
- Related skill 2

## Related Documentation
- `/docs/RELEVANT_DOC.md`
```

### Naming Convention
- Use kebab-case: `build-optimize.md`
- Prefix by domain: `build-*`, `test-*`, `deploy-*`
- Be descriptive: `build-analyze.md` not `analyze.md`

### Best Practices
1. **Clear objectives**: Define exactly what the skill does
2. **Step-by-step**: Break complex tasks into clear steps
3. **Success criteria**: Define measurable outcomes
4. **Examples**: Include usage examples
5. **Links**: Reference related docs and skills
6. **Error handling**: Describe common issues and solutions

## Skill Maintenance

### When to Update Skills
- Build configuration changes
- New optimization techniques discovered
- Tool versions updated
- User feedback on skill effectiveness

### Testing Skills
Before committing skill changes:
1. Test the skill workflow manually
2. Verify all commands work
3. Check documentation links
4. Update success criteria if needed

## Integration with CI/CD

Skills can be automated in CI/CD pipelines:

```yaml
# .github/workflows/build.yml
name: Build Validation

on: [pull_request]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci

      # Corresponds to build-clean.md
      - name: Clean build
        run: npm run clean

      # Corresponds to build-test.md
      - name: Test production build
        run: npm run test:production

      # Corresponds to build-analyze.md
      - name: Analyze bundle size
        run: |
          ANALYZE=true npm run build
          npx size-limit

      - name: Comment PR with results
        # Post analysis results to PR
```

## Related Documentation

### Build Documentation
- `/docs/BUILD_OPTIMIZATION.md` - Comprehensive build optimization guide
- `/CLAUDE.md` - AI assistant guide (includes build patterns)
- `/docs/PERFORMANCE.md` - Performance guidelines

### Development Documentation
- `/docs/DEVELOPER_SETUP.md` - Initial setup guide
- `/docs/ARCHITECTURE.md` - System architecture
- `/README.md` - Project overview

### Deployment Documentation
- `/docs/DEPLOYMENT.md` - Deployment procedures
- `/netlify.toml` - Netlify configuration
- `/.github/workflows/` - CI/CD workflows

## Feedback & Improvements

### Report Issues
If a skill doesn't work as expected:
1. Check the related documentation
2. Verify tool requirements are met
3. Try manual execution of steps
4. Report issue with details (what you tried, what happened, expected behavior)

### Suggest Improvements
Skills should evolve based on usage:
- New optimization techniques
- Better error handling
- More detailed analysis
- Additional automation

## Quick Reference

| Need | Skill | Command Example |
|------|-------|-----------------|
| Reduce bundle size | `build-optimize.md` | "Optimize the build" |
| Understand bundle | `build-analyze.md` | "Analyze bundle composition" |
| Verify build works | `build-test.md` | "Test production build" |
| Clear caches | `build-clean.md` | "Clean build artifacts" |
| Pre-deployment check | Multiple | "Prepare for deployment" |
| Fix build issues | `build-clean.md` → rebuild | "Clean and rebuild" |

---

**Last Updated**: 2025-12-10

For questions about skills or to suggest new ones, consult the team lead or open a GitHub issue.
