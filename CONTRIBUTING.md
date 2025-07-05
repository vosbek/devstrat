# Contributing to AI Strategy Hub

Thank you for your interest in contributing to the AI Strategy Hub! This guide will help you understand how to contribute effectively to this community-driven intelligence system.

## 🎯 Types of Contributions

### 1. Data Updates
- **Tool evaluations** and reviews
- **Training content** and curricula updates
- **Metrics data** and analytics
- **Community patterns** and best practices

### 2. Feature Enhancements
- **New AI integrations**
- **Enhanced visualizations**
- **Improved user experience**
- **Additional analytics**

### 3. Documentation
- **Usage guides** and tutorials
- **Best practices** documentation
- **API documentation**
- **Training materials**

### 4. Bug Reports
- **Issue identification** and reproduction
- **Error documentation**
- **Compatibility problems**
- **Performance issues**

## 📋 Data Contribution Guidelines

### Tool Data (`data/tools.json`)

When adding or updating tool information:

```json
{
  "id": "tool-name",
  "name": "Tool Display Name",
  "category": "IDE_INTEGRATION|AI_FIRST_IDE|AI_ASSISTANT|AGENT_FRAMEWORK",
  "vendor": "Vendor Name",
  "status": "DEPLOYED|PILOT_COMPLETE|EVALUATION|DISCOVERY",
  "evaluation_score": 8.5,
  "cost_per_user_monthly": 20,
  "use_cases": ["specific", "use", "cases"],
  "strengths": ["key", "strengths"],
  "weaknesses": ["identified", "limitations"],
  "pilot_feedback": "Detailed feedback from pilot testing",
  "recommendation": "EXPAND_PILOT|DEPLOY|EVALUATE|NOT_RECOMMENDED",
  "last_updated": "2025-01-15"
}
```

**Required Fields:**
- `id`, `name`, `category`, `vendor`, `status`, `last_updated`

**Guidelines:**
- Use consistent naming conventions
- Include quantitative data when available
- Provide specific, actionable feedback
- Update `last_updated` field with each change

### Training Data (`data/training.json`)

When contributing training content:

```json
{
  "id": "course-id",
  "level": "beginner|intermediate|advanced",
  "name": "Course Title",
  "description": "Detailed course description",
  "duration_hours": 8,
  "modules": [
    {
      "id": "module-id",
      "name": "Module Title",
      "duration_hours": 2,
      "topics": ["topic1", "topic2"],
      "completion_rate": 85,
      "satisfaction": 4.2
    }
  ],
  "prerequisites": ["prerequisite-course-ids"],
  "certification": "Certificate Name"
}
```

### Metrics Data (`data/metrics.json`)

When updating metrics:
- Use consistent date formats (`YYYY-MM-DD`)
- Include data sources and collection methods
- Validate calculations and percentages
- Maintain historical data integrity

## 🔄 Contribution Process

### Step 1: Fork and Clone
```bash
# Fork the repository on GitHub
# Clone your fork locally
git clone https://github.com/your-username/ai-strategy-hub.git
cd ai-strategy-hub
```

### Step 2: Create a Branch
```bash
# Create a descriptive branch name
git checkout -b feature/add-windsurf-evaluation
# or
git checkout -b data/update-cursor-metrics
# or
git checkout -b docs/improve-setup-guide
```

### Step 3: Make Changes
- **Data changes**: Update relevant JSON files
- **Code changes**: Follow existing patterns and conventions
- **Documentation**: Use clear, concise language
- **Testing**: Verify changes work locally

### Step 4: Commit and Push
```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "Add Windsurf IDE evaluation data and pilot results"

# Push to your fork
git push origin feature/add-windsurf-evaluation
```

### Step 5: Submit Pull Request
1. **Go to GitHub** and create a pull request
2. **Use the template** provided below
3. **Provide context** for your changes
4. **Link related issues** if applicable

## 📝 Pull Request Template

```markdown
## Description
Brief description of what this PR accomplishes.

## Type of Change
- [ ] Data update (tools, training, metrics)
- [ ] Feature enhancement
- [ ] Bug fix
- [ ] Documentation update
- [ ] Other (please describe)

## Changes Made
- Specific change 1
- Specific change 2
- Specific change 3

## Testing Done
- [ ] Verified JSON syntax is valid
- [ ] Tested locally in browser
- [ ] Checked responsive design
- [ ] Validated data accuracy

## Data Sources
(For data updates only)
- Source 1: [description and link]
- Source 2: [description and link]

## Impact
- Who will benefit from this change?
- What metrics might be affected?
- Any potential risks or considerations?

## Screenshots
(If applicable - especially for UI changes)

## Additional Notes
Any other context or considerations for reviewers.
```

## 🎨 Code Style Guidelines

### JavaScript
- Use **ES6+ features** where appropriate
- Follow **existing naming conventions**
- Add **comments for complex logic**
- Keep **functions focused and small**
- Use **async/await** for promises

```javascript
// Good
class ToolEvaluator {
    async evaluateTool(tool) {
        const score = await this.calculateScore(tool);
        return this.formatResult(score);
    }
}

// Avoid
function doEverything(tool) {
    // 100+ lines of mixed concerns
}
```

### HTML/CSS
- Use **semantic HTML5** elements
- Follow **Tailwind CSS** utility patterns
- Ensure **accessibility** (ARIA labels, semantic structure)
- Maintain **responsive design**

### JSON Data
- Use **consistent formatting** (2-space indentation)
- Validate **syntax** before committing
- Include **all required fields**
- Use **ISO date formats** (YYYY-MM-DD)

## 🧪 Testing Your Changes

### Local Testing
1. **Open `index.html`** in a modern browser
2. **Navigate between portals** to verify functionality
3. **Test with and without** AI API key
4. **Check responsive design** on different screen sizes
5. **Verify data loading** and error handling

### Data Validation
```bash
# Validate JSON syntax
node -e "console.log('Valid JSON:', JSON.parse(require('fs').readFileSync('data/tools.json', 'utf8')))"

# Or use online validators
# https://jsonlint.com/
```

### Browser Compatibility
Test in:
- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (if available)
- **Edge** (latest)

## 📊 Data Quality Standards

### Accuracy
- **Verify information** from official sources
- **Cross-reference data** when possible
- **Include data collection dates**
- **Note estimation methods** for projected values

### Completeness
- **Fill all required fields**
- **Provide context** for decisions
- **Include qualitative feedback**
- **Document data sources**

### Consistency
- **Use standard categories** and classifications
- **Follow naming conventions**
- **Maintain format consistency**
- **Update related data** when making changes

## 🔍 Review Process

### Automated Checks
- **JSON syntax validation**
- **Link checking** (coming soon)
- **Performance testing** (coming soon)

### Manual Review
1. **Data accuracy** verification
2. **Code quality** assessment
3. **User experience** testing
4. **Documentation** completeness

### Review Criteria
- ✅ **Accuracy**: Information is correct and well-sourced
- ✅ **Relevance**: Contribution adds value to users
- ✅ **Quality**: Meets code and data standards
- ✅ **Completeness**: All required information included
- ✅ **Testing**: Changes have been tested locally

## 🚀 Getting Help

### Documentation
- **README.md**: Overview and setup instructions
- **Code comments**: Inline documentation
- **Data schemas**: Field definitions and examples

### Communication
- **GitHub Issues**: Bug reports and feature requests
- **Pull Request discussions**: Code review conversations
- **Internal channels**: Team-specific communication

### Common Issues

**Q: My JSON changes aren't showing up**
A: Check browser cache, verify JSON syntax, ensure proper file paths

**Q: Charts aren't rendering**
A: Verify Chart.js is loaded, check console for errors, validate data format

**Q: AI features not working**
A: Ensure API key is set, check network connectivity, verify API quotas

## 🎯 Contribution Ideas

### High Impact
- **Add new tool evaluations** based on real testing
- **Update ROI calculations** with actual data
- **Create training modules** for emerging techniques
- **Improve competitive analysis** data

### Quick Wins
- **Fix typos** and improve documentation
- **Update tool statuses** based on latest info
- **Add missing data fields**
- **Improve error messages**

### Advanced Features
- **New chart types** and visualizations
- **Enhanced AI integrations**
- **Additional data sources**
- **Performance optimizations**

## 📈 Recognition

### Contributor Credits
- **Contributors page** highlighting major contributions
- **Commit history** preserving attribution
- **Release notes** acknowledging contributors
- **Community spotlights** for exceptional contributions

### Impact Tracking
- **Download metrics** for contributed patterns
- **Usage analytics** for features you've built
- **Feedback scores** for training content
- **Adoption rates** for tool recommendations

## 🔒 Security Guidelines

### Data Sensitivity
- **No API keys** or secrets in commits
- **No personal information** without consent
- **Aggregate data only** for metrics
- **Follow privacy policies**

### Code Security
- **Validate user inputs**
- **Sanitize data** before display
- **Use HTTPS** for external requests
- **Follow OWASP guidelines**

## 📅 Release Process

### Regular Updates
- **Weekly data refreshes** for active metrics
- **Monthly feature releases**
- **Quarterly major updates**
- **Annual architecture reviews**

### Emergency Updates
- **Security fixes**: Immediate deployment
- **Critical bugs**: Same-day fixes
- **Data corrections**: As needed

---

**Thank you for contributing to AI Strategy Hub!** Your contributions help create a better experience for developers and strategy teams at Nationwide Insurance.

🤝 **Questions?** Open an issue or reach out to the maintainers
📧 **Contact**: ai-strategy@nationwide.com