import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  variant?: 'default' | 'white' | 'hero' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  subtitle?: string;
  hideText?: boolean;
  fontFamily?: string;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'default',
  size = 'md',
  subtitle,
  hideText = false,
  fontFamily = "'Plus Jakarta Sans', 'Outfit', sans-serif"
}) => {
  let isDarkTheme = true;
  try {
    const { theme } = useTheme();
    isDarkTheme = theme === 'dark';
  } catch {
    isDarkTheme = !document.documentElement.classList.contains('light');
  }

  const imgHeights = { sm: '26px', md: '32px', lg: '42px' };
  const fontSizes = { sm: '15px', md: '19px', lg: '24px' };

  // Determine if we should show the white logo (/MarkPock.png)
  const showWhite = variant === 'white' || variant === 'hero' || (variant === 'default' && isDarkTheme);
  const currentSize = imgHeights[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: size === 'sm' ? '8px' : '10px', minWidth: 0 }}>
      {/* Logo Image Container - Shows full logo when hideText is false, crops to icon when hideText is true */}
      <div style={{
        position: 'relative',
        height: currentSize,
        width: hideText ? currentSize : 'auto',
        borderRadius: '8px',
        flexShrink: 0,
        display: 'inline-block',
        overflow: hideText ? 'hidden' : 'visible',
      }}>
        {/* Light Mode Logo (dark-logo.png) */}
        <img
          src="/dark-logo.png"
          alt="markPocket Logo Light"
          style={{
            height: currentSize,
            width: hideText ? 'auto' : 'auto',
            maxWidth: hideText ? 'none' : '180px',
            objectFit: hideText ? 'cover' : 'contain',
            objectPosition: hideText ? 'left center' : 'center',
            borderRadius: '8px',
            display: 'block',
            opacity: showWhite ? 0 : 1,
            transition: 'opacity 0.35s ease-in-out, transform 0.35s ease-in-out',
            transform: showWhite ? 'scale(0.96)' : 'scale(1)',
          }}
        />
        {/* Dark Mode Logo (MarkPock.png) */}
        <img
          src="/MarkPock.png"
          alt="markPocket Logo Dark"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: currentSize,
            width: hideText ? 'auto' : '100%',
            objectFit: hideText ? 'cover' : 'contain',
            objectPosition: hideText ? 'left center' : 'center',
            borderRadius: '8px',
            opacity: showWhite ? 1 : 0,
            transition: 'opacity 0.35s ease-in-out, transform 0.35s ease-in-out',
            transform: showWhite ? 'scale(1)' : 'scale(0.96)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {subtitle && (
        <span style={{
          fontWeight: 800,
          fontSize: fontSizes[size],
          lineHeight: 1.1,
          color: showWhite ? '#FFFFFF' : 'var(--text-dark)',
          letterSpacing: '-0.03em',
          fontFamily: fontFamily,
          display: 'inline-flex',
          alignItems: 'baseline',
          gap: '3px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          transition: 'color 0.35s ease-in-out',
        }}>
          <span style={{
            color: showWhite ? '#FFFFFF' : 'var(--text-dark)',
            fontWeight: 700,
            fontSize: '0.82em',
            opacity: 0.85,
            marginLeft: '3px',
            transition: 'color 0.35s ease-in-out',
            letterSpacing: '-0.01em'
          }}>
            {subtitle}
          </span>
        </span>
      )}
    </div>
  );
};
