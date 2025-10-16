# Student Finance Tracker

A responsive, accessible, offline-first web application for tracking student expenses built with vanilla HTML, CSS, and JavaScript. This project demonstrates modern web development practices including mobile-first design, comprehensive accessibility features, clean modular architecture, and progressive web app capabilities.

## 🚀 Live Demo & Video

**GitHub Pages:** [https://ucezette.github.io/Student_Finance_Tracker](https://ucezette.github.io/Student_Finance_Tracker)  
**Demo Video:** [https://youtu.be/example-demo-video](https://youtu.be/example-demo-video) *(Unlisted YouTube link showing keyboard navigation, regex edge cases, and import/export)*

## 📋 Chosen Theme: Student Finance Tracker

This application helps students manage their expenses, track spending patterns, and stay within budget. It provides comprehensive financial tracking with advanced search capabilities, budget management, insightful analytics, and offline functionality for use anywhere.

## ✨ Complete Features List

### Core Functionality
- ✅ **Complete CRUD Operations** - Add, view, edit, and delete financial transactions
- ✅ **Advanced Regex Search** - Powerful search with pattern highlighting and 7+ patterns
- ✅ **Smart Sorting** - Sort by date, description, amount, or category with visual indicators
- ✅ **Real-time Validation** - 4+ comprehensive validation rules with immediate feedback
- ✅ **Data Persistence** - Auto-save to localStorage with automatic backup system
- ✅ **Multi-currency Support** - USD, EUR, GBP with manual exchange rates
- ✅ **Budget Tracking** - Set spending caps with visual progress and ARIA alerts

### Progressive Web App Features
- ✅ **Offline-First** - Full functionality without internet via Service Worker
- ✅ **Dark/Light Theme Toggle** - Persistent theme switching with system preference detection
- ✅ **PWA Installation** - Install as native app on mobile and desktop
- ✅ **Background Sync** - Data synchronization when connection restored
- ✅ **App Shortcuts** - Quick actions from app icon/launcher

### Data Management
- ✅ **JSON Import/Export** - Full data portability with structure validation
- ✅ **CSV Export** - Properly escaped CSV export for Excel/Sheets compatibility
- ✅ **Data Validation** - Comprehensive import validation with error reporting
- ✅ **Backup System** - Automatic local backups with cleanup

### Advanced Tools
- ✅ **jQuery Scraper Page** - Parse HTML snippets with selectors to extract transaction data
- ✅ **Interactive Regex Tester** - Test patterns with real-time results and explanations
- ✅ **Pattern Library** - Pre-built regex patterns for common financial data

### Dashboard & Analytics
- ✅ **Statistics Overview** - Total records, spending, top categories with visual indicators
- ✅ **Trend Analysis** - 7-day spending trends with interactive CSS/JS charts
- ✅ **Category Insights** - Spending breakdown by category with percentages
- ✅ **Budget Alerts** - ARIA-announced warnings when approaching limits
- ✅ **Spending Forecasting** - Predictive analytics based on historical data

### User Experience
- ✅ **Responsive Design** - Mobile-first approach with 3 breakpoints (360px, 768px, 1024px)
- ✅ **Full Accessibility** - WCAG AA compliant with comprehensive keyboard navigation
- ✅ **Progressive Enhancement** - Core functionality works without JavaScript
- ✅ **Loading States** - Visual feedback for all async operations
- ✅ **Error Handling** - Graceful error recovery with user-friendly messages

## 🧪 Comprehensive Regex Catalog

### Core Validation Patterns (Required 4+)
| Pattern | Usage | Valid Examples | Invalid Examples |
|---------|-------|----------------|------------------|
| `^\S(?:.*\S)?$` | Description validation | "Lunch at cafeteria" ✓ | " Leading space" ✗ |
| `^(0|[1-9]\d*)(\.\d{1,2})?$` | Amount validation | "12.50", "999" ✓ | "01", "-5.99" ✗ |
| `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$` | Date validation | "2025-10-15" ✓ | "2025-13-32" ✗ |
| `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | Category validation | "Personal Care" ✓ | "Food123" ✗ |

### Advanced Search Patterns (1+ Required)
| Pattern | Description | Example Matches | Use Case |
|---------|-------------|-----------------|----------|
| `\b(\w+)\s+\1\b` | Duplicate words (back-reference) | "coffee coffee", "tea tea" | Find data entry errors |
| `\.\d{2}\b` | Amounts with cents | $12.50, $99.99 | Find precise amounts |
| `(coffee|tea|juice|soda|water)` | Beverage keywords | coffee shop, tea break | Category analysis |
| `\$([5-9]\d|[1-9]\d{2,})` | Large expenses ($50+) | $50.00, $125.99 | Budget alerts |
| `^(Food|Entertainment|Transport)$` | Specific categories | Exact category matches | Filtering |
| `\$\d+\.00\b` | Round amounts | $25.00, $100.00 | Expense patterns |
| `(?=.*[A-Z])(?=.*\d)` | Complex validation (lookahead) | Strong passwords | Advanced validation |

### Finance-Specific Patterns
| Pattern | Purpose | Matches | Application |
|---------|---------|---------|-------------|
| `\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b` | Credit card numbers | 1234-5678-9012-3456 | Data extraction |
| `^@\w+:` | Tag filters | @category:food | Advanced search |
| `\b\d{1,2}:\d{2}\b` | Time patterns | 14:30, 9:15 | Time analysis |
| `^\d{3}-\d{2}-\d{4}$` | SSN format | 123-45-6789 | Data validation |

## ⌨️ Complete Keyboard Navigation Map

### Global Navigation
| Key Combination | Action | Context |
|----------------|---------|---------|
| `Tab` | Navigate to next interactive element | Global |
| `Shift + Tab` | Navigate to previous interactive element | Global |
| `Enter/Space` | Activate buttons and links | Global |
| `Escape` | Cancel editing mode or close dialogs | Global |
| `Arrow Keys` | Navigate within tables and lists | Tables/Lists |

### Application Shortcuts
| Key Combination | Action | Description |
|----------------|---------|-------------|
| `Alt + 1` | Navigate to Dashboard | Quick section access |
| `Alt + 2` | Navigate to Records | Quick section access |
| `Alt + 3` | Navigate to Add/Edit form | Quick section access |
| `Alt + T` | Toggle dark/light theme | Theme switching |
| `Ctrl + Enter` | Submit form | When in Add/Edit section |
| `Ctrl + S` | Save current state | Data persistence |

### Form Navigation
| Key | Action | Context |
|-----|---------|---------|
| `Tab` | Move to next form field | Forms |
| `Shift + Tab` | Move to previous form field | Forms |
| `Enter` | Submit form | Form submission |
| `Escape` | Clear form or cancel edit | Form editing |
| `Arrow Keys` | Navigate select options | Dropdown menus |

### Search & Filter
| Key | Action | Description |
|-----|---------|-------------|
| `Ctrl + F` | Focus search input | Quick search access |
| `Enter` | Execute search | Search confirmation |
| `Escape` | Clear search | Search reset |

## ♿ Comprehensive Accessibility Notes

### WCAG AA Compliance Features
- **Semantic HTML Structure** - Proper heading hierarchy (h1→h2→h3) and landmark elements
- **ARIA Support** - Live regions, labels, roles, and descriptions for dynamic content
- **Focus Management** - Visible focus indicators with 2px outline and logical tab order
- **Color Contrast** - 4.5:1 minimum contrast ratio with high contrast mode support
- **Keyboard Navigation** - Complete functionality without mouse input required
- **Screen Reader Support** - Descriptive text, status announcements, and context

### Accessibility Testing Completed
- ✅ **Keyboard Navigation** - Full application usable with keyboard only
- ✅ **Screen Reader Testing** - Compatible with NVDA, JAWS, and VoiceOver
- ✅ **Color Contrast** - Verified with WebAIM Color Contrast Analyzer
- ✅ **Focus Indicators** - Visible focus on all interactive elements
- ✅ **ARIA Live Regions** - Dynamic content announced to assistive technology
- ✅ **Reduced Motion** - Respects user preference for reduced animations

### Screen Reader Features
- **Skip Links** - Direct navigation to main content
- **Landmark Navigation** - header, nav, main, section, footer regions
- **Form Labels** - All inputs properly labeled and described
- **Status Announcements** - Real-time feedback for user actions
- **Error Reporting** - Accessible error messages with ARIA alerts
- **Context Information** - Descriptive button labels and help text

## 🧪 How to Run Tests

1. **Open Test Suite**: Navigate to `tests.html` in your browser
2. **Run All Tests**: Click "Run All Tests" for complete validation
3. **Interactive Testing**: Use the regex tester for pattern experimentation
4. **Manual Testing**: Follow accessibility checklist for manual verification

## 🚀 Setup & Installation Instructions

### Prerequisites
- Modern web browser with ES6 module support (Chrome 61+, Firefox 60+, Safari 11+)
- Local web server for development (required for ES6 modules and Service Worker)

### Quick Start


### Installation
1. **Clone the repository**
   ```bash
   git clone https://github.com/ucEzette/Student_Finance_Tracker.git
   cd Student_Finance_Tracker
   ```

2. **Start a local web server**
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (http-server)
   npx http-server

   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

4. **Load sample data** (optional)
   - Go to Settings → Data Management
   - Import `seed.json` for sample transactions

### Development
- No build process required - pure vanilla JavaScript
- ES6 modules loaded natively by browser
- Live reload available with browser dev tools
- CSS custom properties for easy theming

## 📱 Responsive Breakpoints

| Device | Breakpoint | Layout |
|--------|------------|--------|
| Mobile | 320px - 767px | Single column, card view, hamburger menu |
| Tablet | 768px - 1023px | Two columns, expanded nav, table view |
| Desktop | 1024px+ | Multi-column, full navigation, enhanced features |

## 🎨 Design Features

### Mobile-First CSS
- CSS Custom Properties for consistent theming
- Flexbox and Grid for responsive layouts
- Touch-friendly interface (44px+ touch targets)
- Optimized for thumb navigation

### Visual Design
- Clean, modern interface inspired by material design
- Consistent color scheme with high contrast
- Smooth animations with respect for reduced motion preference
- Progressive disclosure of complex features

## 📊 Browser Support

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 61+ | ✅ Full support |
| Firefox | 60+ | ✅ Full support |
| Safari | 10.1+ | ✅ Full support |
| Edge | 16+ | ✅ Full support |
| IE 11 | - | ❌ Not supported (ES6 modules) |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation for API changes
- Ensure accessibility compliance
- Test across multiple browsers and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Contact Information

**Developer:** Your Name  
**Email:** [ucheezette@gmail.com](mailto:ucheezette@gmail.com)  
**GitHub:** [https://github.com/ucEzette](https://github.com/ucEzette)  


## 🙏 Acknowledgments

- Assignment requirements from the Web Development course
- Accessibility guidelines from WCAG 2.1
- Design inspiration from modern financial applications
- Community feedback and testing assistance
### 🤝 Collaborative Credit

This project was collaboratively developed by  **[ucEzette](https://github.com/ucEzette)** with research and writing assistance from **ChatGPT (OpenAI’s GPT-5 language model)** to enhance clarity, structure, and documentation quality.

---

**Built using vanilla HTML, CSS, and JavaScript**
