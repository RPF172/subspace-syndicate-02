import DOMPurify from 'dompurify';

export function generateSafeCSS(themes: Record<string, string>, id: string, colorConfig: [string, any][]): string {
  // Validate and sanitize inputs
  if (!id || typeof id !== 'string') {
    throw new Error('Invalid chart ID');
  }
  
  // Escape CSS identifiers
  const safeId = CSS.escape(id);
  
  const cssRules = Object.entries(themes)
    .map(([theme, prefix]) => {
      if (typeof theme !== 'string' || typeof prefix !== 'string') {
        return '';
      }
      
      const safeTheme = CSS.escape(theme);
      const safePrefix = CSS.escape(prefix);
      
      const colorRules = colorConfig
        .map(([key, itemConfig]) => {
          if (typeof key !== 'string' || !itemConfig) {
            return '';
          }
          
          const safeKey = CSS.escape(key);
          // Validate color values - allow hex colors, rgb(), rgba(), hsl(), hsla()
          const color = itemConfig.color;
          if (typeof color !== 'string') {
            return '';
          }
          
          // Enhanced color validation
          const colorRegex = /^(#[0-9A-Fa-f]{3,8}|rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)|rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[01]?(\.\d+)?\s*\)|hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)|hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[01]?(\.\d+)?\s*\))$/;
          
          if (!colorRegex.test(color)) {
            console.warn(`Invalid color value: ${color}`);
            return '';
          }
          
          return `  --color-${safeKey}: ${color};`;
        })
        .filter(Boolean)
        .join('\n');
      
      return `${safePrefix} [data-chart="${safeId}"] {\n${colorRules}\n}`;
    })
    .filter(Boolean)
    .join('\n\n');
  
  // Sanitize the final CSS - DOMPurify with custom config for CSS
  const sanitizedCSS = DOMPurify.sanitize(cssRules, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    CUSTOM_ELEMENT_HANDLING: {
      tagNameCheck: null,
      attributeNameCheck: null,
      allowCustomizedBuiltInElements: false,
    },
  });
  
  return sanitizedCSS;
}

export function validateCSSProperty(property: string, value: string): boolean {
  // Whitelist of safe CSS properties for charts
  const allowedProperties = [
    'color', 'background-color', 'border-color', 'fill', 'stroke',
    '--color-', // CSS custom properties for colors
  ];
  
  const isAllowedProperty = allowedProperties.some(allowed => 
    property.startsWith(allowed)
  );
  
  if (!isAllowedProperty) {
    return false;
  }
  
  // Additional validation for values
  if (value.includes('javascript:') || value.includes('data:') || value.includes('expression(')) {
    return false;
  }
  
  return true;
}