# Student Finance Tracker

A responsive, accessible web application for tracking student expenses built with vanilla HTML, CSS, and JavaScript. This project demonstrates modern web development practices including mobile-first design, comprehensive accessibility features, and clean modular architecture.

##  Live Demo

**GitHub Pages:** [https://github.com/ucEzette/Student_Finance_Tracker](https://github.com/ucEzette/Student_Finance_Tracker)

## Theme: Student Finance Tracker

This application helps students manage their expenses, track spending patterns, and stay within budget. It provides comprehensive financial tracking with advanced search capabilities, budget management, and insightful analytics.

## ✨ Features

### Core Functionality
- ✅ **Complete CRUD Operations** - Add, view, edit, and delete financial transactions
- ✅ **Advanced Search** - Regex-powered search with pattern highlighting
- ✅ **Smart Sorting** - Sort by date, description, amount, or category
- ✅ **Real-time Validation** - Comprehensive form validation with immediate feedback
- ✅ **Data Persistence** - Auto-save to localStorage with import/export capabilities
- ✅ **Multi-currency Support** - USD, EUR, GBP with manual exchange rates
- ✅ **Budget Tracking** - Set spending caps with visual progress indicators

### Dashboard & Analytics
- ✅ **Statistics Overview** - Total records, spending, top categories
- ✅ **Trend Analysis** - 7-day spending trends with visual charts
- ✅ **Category Insights** - Spending breakdown by category
- ✅ **Budget Alerts** - ARIA-announced warnings when approaching limits

### User Experience
- ✅ **Responsive Design** - Mobile-first approach with 3 breakpoints (360px, 768px, 1024px)
- ✅ **Full Accessibility** - WCAG AA compliant with keyboard navigation
- ✅ **Progressive Enhancement** - Works without JavaScript for core functionality
- ✅ **Offline Capable** - All data stored locally, no internet required

## 🧪 Regex Catalog

### Core Validation Patterns
| Pattern | Usage | Example |
|---------|-------|---------|
| `^\S(?:.*\S)?$` | Description validation | "Lunch at cafeteria" ✓, " Leading space" ✗ |
| `^(0|[1-9]\d*)(\.\d{1,2})?$` | Amount validation | "12.50" ✓, "01" ✗ |
| `^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$` | Date validation | "2025-10-15" ✓, "2025-13-32" ✗ |
| `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | Category validation | "Personal Care" ✓, "Food123" ✗ |

### Advanced Search Patterns
| Pattern | Description | Example Matches |
|---------|-------------|-----------------|
| `\.\d{2}\b` | Amounts with cents | $12.50, $99.99 |
| `(coffee|tea|juice|soda|water)` | Beverage keywords | coffee shop, tea break |
| `\b(\w+)\s+\1\b` | Duplicate words (back-reference) | "the the", "coffee coffee" |
| `\$([5-9]\d|[1-9]\d{2,})` | Large expenses ($50+) | $50.00, $125.99 |
| `^(Food|Entertainment|Transport)$` | Specific categories | Exact category matches |

### Finance-Specific Patterns
| Pattern | Purpose | Matches |
|---------|---------|---------|
| `\$\d+\.00\b` | Round amounts | $25.00, $100.00 |
| `\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b` | Credit card numbers | 1234-5678-9012-3456 |
| `^@\w+:` | Tag filters | @category:food |

## ⌨️ Keyboard Navigation

| Key Combination | Action |
|----------------|---------|
| `Tab` | Navigate to next interactive element |
| `Shift + Tab` | Navigate to previous interactive element |
| `Enter/Space` | Activate buttons and links |
| `Escape` | Cancel editing mode or close dialogs |
| `Alt + 1` | Navigate to Dashboard |
| `Alt + 2` | Navigate to Records |
| `Alt + 3` | Navigate to Add/Edit form |
| `Ctrl + Enter` | Submit form (when in Add/Edit section) |
| `Arrow Keys` | Navigate within tables and lists |

## ♿ Accessibility Features

### WCAG AA Compliance
- **Semantic HTML** - Proper heading hierarchy and landmark elements
- **ARIA Support** - Live regions, labels, and roles for screen readers
- **Focus Management** - Visible focus indicators and logical tab order
- **Color Contrast** - 4.5:1 minimum contrast ratio throughout
- **Keyboard Navigation** - Full functionality without mouse
- **Screen Reader Support** - Descriptive text and status announcements

### Accessibility Testing
- ✅ Keyboard-only navigation tested
- ✅ Screen reader compatibility (NVDA, JAWS, VoiceOver)
- ✅ Color contrast verified with tools
- ✅ ARIA live regions for dynamic content
- ✅ Focus trapping in modal contexts
- ✅ Skip-to-content link provided

## 🏗️ Technical Architecture

### File Structure
```
student-finance-tracker/
├── index.html              # Main application HTML
├── styles/
│   └── main.css           # Mobile-first responsive styles
├── scripts/
│   ├── main.js            # Application entry point
│   ├── storage.js         # localStorage operations
│   ├── state.js           # Application state management
│   ├── ui.js              # DOM manipulation and rendering
│   ├── validators.js      # Form validation and regex patterns
│   ├── search.js          # Search functionality
│   └── stats.js           # Statistics and analytics
├── seed.json              # Sample data for testing
├── tests.html             # Test suite and validation
└── README.md             # This file
```

### Module Architecture
- **ES6 Modules** - Clean separation of concerns with import/export
- **State Management** - Centralized state with observer pattern
- **Error Handling** - Comprehensive error handling and user feedback
- **Performance** - Debounced search, cached calculations, efficient rendering
- **Security** - Input sanitization, safe regex compilation

### Data Model
```javascript
{
  id: "txn_001",                    // Unique identifier
  description: "Lunch at cafeteria", // Transaction description
  amount: 12.50,                    // Amount in base currency
  category: "Food",                 // Category classification
  date: "2025-10-15",              // ISO date format
  createdAt: "2025-10-15T12:30:00Z", // Creation timestamp
  updatedAt: "2025-10-15T12:30:00Z"  // Last update timestamp
}
```

## 🧪 Testing

### Test Suite (tests.html)
- **Regex Validation Tests** - All 4+ validation patterns thoroughly tested
- **Form Validation** - Complete form validation with edge cases
- **Data Processing** - Statistics calculations and data transformations
- **Search Functionality** - Regex compilation and search filtering
- **Accessibility** - Automated and manual accessibility checks

### Running Tests
1. Open `tests.html` in a web browser
2. Click "Run All Tests" to execute the complete test suite
3. Use the interactive regex tester to experiment with patterns
4. Verify accessibility features manually

### Sample Test Cases
```javascript
// Description validation
"Lunch at cafeteria" ✅        // Valid
" Leading space" ❌           // Invalid - leading space
"Trailing space " ❌          // Invalid - trailing space

// Amount validation  
"12.50" ✅                   // Valid with cents
"999" ✅                    // Valid integer
"-5.99" ❌                  // Invalid - negative
"12.345" ❌                 // Invalid - too many decimals

// Advanced patterns
"coffee coffee shop" ✅      // Matches duplicate word pattern
"$12.50 and $99.99" ✅      // Matches cents pattern (2 matches)
```

## 🚀 Setup Instructions

### Prerequisites
- Modern web browser with ES6 module support
- Local web server (for development)

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

**Built with ❤️ using vanilla HTML, CSS, and JavaScript**
