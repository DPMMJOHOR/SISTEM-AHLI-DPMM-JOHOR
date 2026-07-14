# DPMM Logo Usage Guidelines

## Logo Files

### Available Logos
- `dpmm-logo-color.png` - Full color DPMM logo (primary)
- `logo-dpmmnj.png` - Alternative DPMM Negeri Johor logo

### Logo Locations
- Sistem Ahli: `dpmm-logo-color.png` (in root directory)
- borang.html: `dpmm-logo-color.png` (in root directory)
- Sistem Mesyuarat: To be added (separate repo)

## Logo Usage Standards

### Size Guidelines
- **Header Logo**: 120px width × 120px height (borang.html standard)
- **Sidebar Logo**: 40px width × 40px height (Sistem Ahli standard)
- **QR Code Logo**: 22% of QR code size (Sistem Ahli QR generation)
- **Consistency**: Maintain aspect ratio, do not stretch or distort

### Placement Guidelines
- **Header**: Top-left or center-aligned in header section
- **Sidebar**: Top of sidebar, vertically centered
- **QR Code**: Centered within QR code badge
- **Spacing**: Minimum 16px padding around logo

### Alt Text
- **Standard**: "Logo DPMM Negeri Johor"
- **Context-specific**: Adjust based on usage (e.g., "DPMM Logo" in sidebar)

### File Paths
- **Relative Path**: `dpmm-logo-color.png` (preferred for same-directory files)
- **Absolute Path**: `https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/dpmm-logo-color.png` (for cross-repo references)

## Implementation Examples

### borang.html (Header Logo)
```html
<div class="header-logo">
  <img src="dpmm-logo-color.png" 
       alt="Logo DPMM Negeri Johor" 
       style="width:120px;height:120px;object-fit:contain;">
</div>
```

### Sistem Ahli (Sidebar Logo)
```html
<div class="sb-logo-wrap">
  <img src="dpmm-logo-color.png" 
       alt="DPMM Logo" 
       class="sb-logo-round">
</div>
```

### Sistem Ahli (QR Code Logo)
```javascript
var DPMM_LOGO = 'https://dpmmjohor.github.io/SISTEM-AHLI-DPMM-JOHOR/dpmm-logo-color.png';
// Used in QR code generation function
```

## CSS Classes

### Header Logo (borang.html)
```css
.header-logo {
  /* Flex centering */
  display: flex;
  align-items: center;
  justify-content: center;
  /* Spacing */
  padding: 16px;
  /* Responsive */
  width: 100%;
}
```

### Sidebar Logo (Sistem Ahli)
```css
.sb-logo-wrap {
  /* Positioning */
  display: flex;
  align-items: center;
  justify-content: center;
  /* Sizing */
  width: 40px;
  height: 40px;
  /* Styling */
  border-radius: 50%;
  overflow: hidden;
}

.sb-logo-round {
  /* Sizing */
  width: 100%;
  height: 100%;
  /* Fit */
  object-fit: contain;
}
```

## Accessibility

### Alt Text Requirements
- Always include descriptive alt text
- Use "DPMM Negeri Johor" for full logo
- Use "DPMM Logo" for simplified contexts
- Avoid decorative-only logos (use `alt=""` if truly decorative)

### Contrast Requirements
- Ensure logo has sufficient contrast against background
- Minimum contrast ratio: 3:1 for large logos, 4.5:1 for small logos
- Test with accessibility checker

## Responsive Design

### Mobile (< 768px)
- Header logo: 80px width × 80px height
- Sidebar logo: 32px width × 32px height
- Maintain aspect ratio

### Tablet (768px - 1024px)
- Header logo: 100px width × 100px height
- Sidebar logo: 36px width × 36px height
- Maintain aspect ratio

### Desktop (> 1024px)
- Header logo: 120px width × 120px height
- Sidebar logo: 40px width × 40px height
- Maintain aspect ratio

## Cross-System Consistency

### Current Implementation Status
- **Sistem Ahli**: Logo used in sidebar and QR code generation
- **borang.html**: Logo used in header (120px × 120px)
- **Sistem Mesyuarat**: Logo not yet applied (separate repo access required)

### Standardization Requirements
- Use `dpmm-logo-color.png` as primary logo across all systems
- Standardize header logo size to 120px × 120px
- Standardize sidebar logo size to 40px × 40px
- Use consistent alt text: "Logo DPMM Negeri Johor"

## Known Limitations

### Sistem Mesyuarat
- Located in separate repo: `../SISTEM-MESYUARAT-DPMM-JOHOR-CLONE/`
- Not accessible from current workspace
- Requires manual intervention or workspace switch to apply logo
- Recommendation: Apply logo during manual review or separate session

## Maintenance

### Logo Updates
- If logo file changes, update all references
- Test logo loading on all systems
- Verify responsive behavior
- Check accessibility compliance

### Version Control
- Logo files tracked in git
- Use consistent file naming
- Document logo changes in commit messages
- Test logo loading after updates

## Testing Checklist

- [ ] Logo loads correctly on all systems
- [ ] Logo size is consistent across systems
- [ ] Logo placement is consistent across systems
- [ ] Alt text is descriptive and consistent
- [ ] Logo maintains aspect ratio
- [ ] Logo has sufficient contrast
- [ ] Logo is responsive on mobile/tablet/desktop
- [ ] Logo loads from correct path (relative vs absolute)
