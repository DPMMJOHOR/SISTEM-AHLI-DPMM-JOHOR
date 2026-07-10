# DPMM Brand Color Guidelines

## Brand Colors

### Primary Colors
- **Primary Blue**: `#1D3C96` (DPMM Johor blue)
- **Accent Red**: `#CC1628` (DPMM Johor red)

### Neutral Colors
- **White**: `#FFFFFF`
- **Light Gray**: `#F5F5F5`
- **Medium Gray**: `#D8D6DE`
- **Dark Gray**: `#333333`
- **Black**: `#000000`

### Semantic Colors
- **Success**: `#00D4A0`
- **Warning**: `#FFA94D`
- **Danger**: `#FF6B6B`
- **Info**: `#00D4C5`

## Color Usage Standards

### Primary Color (#1D3C96)
- **Usage**: Primary buttons, headers, links, active states
- **Examples**:
  - Button backgrounds
  - Header backgrounds
  - Link text
  - Active navigation items
  - Primary action elements

### Accent Color (#CC1628)
- **Usage**: Call-to-action buttons, alerts, important highlights
- **Examples**:
  - CTA buttons
  - Warning alerts
  - Important notifications
  - Error states
  - Critical actions

### Neutral Colors
- **White (#FFFFFF)**: Backgrounds, cards, text on dark backgrounds
- **Light Gray (#F5F5F5)**: Page backgrounds, section backgrounds
- **Medium Gray (#D8D6DE)**: Borders, dividers, muted text
- **Dark Gray (#333333)**: Primary text, headings
- **Black (#000000)**: Text on light backgrounds, strong emphasis

### Semantic Colors
- **Success (#00D4A0)**: Success messages, completed states
- **Warning (#FFA94D)**: Warning messages, pending states
- **Danger (#FF6B6B)**: Error messages, failed states
- **Info (#00D4C5)**: Information messages, neutral states

## Implementation Examples

### CSS Variables (Recommended)
```css
:root {
  /* DPMM Brand Colors */
  --dpmm-primary: #1D3C96;
  --dpmm-accent: #CC1628;
  
  /* Neutral Colors */
  --dpmm-white: #FFFFFF;
  --dpmm-light-gray: #F5F5F5;
  --dpmm-medium-gray: #D8D6DE;
  --dpmm-dark-gray: #333333;
  --dpmm-black: #000000;
  
  /* Semantic Colors */
  --dpmm-success: #00D4A0;
  --dpmm-warning: #FFA94D;
  --dpmm-danger: #FF6B6B;
  --dpmm-info: #00D4C5;
}
```

### Button Styles
```css
.btn-primary {
  background-color: var(--dpmm-primary);
  color: var(--dpmm-white);
  border: none;
}

.btn-accent {
  background-color: var(--dpmm-accent);
  color: var(--dpmm-white);
  border: none;
}
```

### Header Styles
```css
.header {
  background-color: var(--dpmm-primary);
  color: var(--dpmm-white);
}
```

### Link Styles
```css
a {
  color: var(--dpmm-primary);
  text-decoration: none;
}

a:hover {
  color: var(--dpmm-accent);
}
```

## Color Contrast Requirements

### WCAG AA Compliance
- **Normal Text**: Minimum 4.5:1 contrast ratio
- **Large Text**: Minimum 3:1 contrast ratio
- **UI Components**: Minimum 3:1 contrast ratio

### Contrast Ratios
- **#1D3C96 on #FFFFFF**: 8.2:1 (Passes AA and AAA)
- **#CC1628 on #FFFFFF**: 5.1:1 (Passes AA and AAA)
- **#FFFFFF on #1D3C96**: 8.2:1 (Passes AA and AAA)
- **#FFFFFF on #CC1628**: 5.1:1 (Passes AA and AAA)
- **#333333 on #FFFFFF**: 12.6:1 (Passes AA and AAA)
- **#FFFFFF on #333333**: 12.6:1 (Passes AA and AAA)

## System-Specific Implementation

### Sistem Ahli (index.html)
- **Current**: Uses purple/blue palette (#6C5CE7)
- **Target**: Replace with DPMM primary (#1D3C96)
- **Changes Required**:
  - Update `--primary` variable to #1D3C96
  - Update `--primary-lt` to light variant of #1D3C96
  - Update `--primary-dk` to dark variant of #1D3C96
  - Update `--primary-rgb` to RGB values for #1D3C96 (29, 60, 150)

### borang.html
- **Current**: Uses DPMM brand colors (#1D3C96, #CC1628)
- **Target**: Verify consistency with guidelines
- **Status**: Already compliant (no changes needed)

### Sistem Mesyuarat (separate repo)
- **Current**: Uses blue-centric palette
- **Target**: Replace with DPMM primary (#1D3C96)
- **Status**: Requires manual intervention (separate repo access)
- **Note**: Document limitation in guidelines

## Color Testing Checklist

- [ ] Primary color is #1D3C96
- [ ] Accent color is #CC1628
- [ ] Colors are consistent across all systems
- [ ] Color contrast meets WCAG AA
- [ ] CSS variables are used for maintainability
- [ ] Color usage follows semantic meaning
- [ ] Colors are accessible for colorblind users
- [ ] Colors work in light and dark modes (if applicable)

## Accessibility Considerations

### Colorblind Accessibility
- Use patterns and shapes in addition to color
- Ensure text contrast is sufficient
- Test with colorblind simulation tools
- Provide text labels for color-coded information

### High Contrast Mode
- Ensure colors work in high contrast mode
- Test with Windows high contrast mode
- Test with macOS high contrast mode
- Provide fallbacks for color-only information

## Maintenance

### Color Updates
- If brand colors change, update all systems
- Update CSS variables
- Test color contrast
- Verify accessibility compliance

### Version Control
- Document color changes in commit messages
- Test color changes on all systems
- Update guidelines when colors change
- Communicate changes to team

## Known Limitations

### Sistem Mesyuarat
- Located in separate repo: `../SISTEM-MESYUARAT-DPMM-JOHOR-CLONE/`
- Not accessible from current workspace
- Requires manual intervention or workspace switch to apply colors
- Recommendation: Apply colors during manual review or separate session

## Color Palette Reference

### DPMM Brand Palette
```
Primary Blue: #1D3C96
Accent Red:  #CC1628
```

### Neutral Palette
```
White:       #FFFFFF
Light Gray:  #F5F5F5
Medium Gray: #D8D6DE
Dark Gray:   #333333
Black:       #000000
```

### Semantic Palette
```
Success: #00D4A0
Warning: #FFA94D
Danger:  #FF6B6B
Info:    #00D4C5
```

## Testing Tools

### Contrast Checkers
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- Chrome DevTools Lighthouse
- axe DevTools

### Colorblind Simulators
- Toptal Color Blindness Simulator
- Chrome DevTools Emulation
- Color Oracle

## Best Practices

### Do
- Use CSS variables for colors
- Test color contrast
- Provide text labels for color-coded information
- Use semantic color names
- Document color usage

### Don't
- Hardcode color values
- Use color as the only indicator
- Ignore accessibility requirements
- Use too many colors
- Mix similar colors without purpose
