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
      {/* Icon container - cropped to 1:1 square to cleanly show only the MP mark icon */}
      <div style={{
        position: 'relative',
        width: currentSize,
        height: currentSize,
        borderRadius: '8px',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'inline-block'
      }}>
        {/* Light Mode Logo (dark-logo.png) */}
        <img
          src="/dark-logo.png"
          alt="markPocket Logo Light"
          style={{
            height: '100%',
            width: 'auto',
            maxWidth: 'none',
            objectFit: 'cover',
            objectPosition: 'left center',
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
            height: '100%',
            width: 'auto',
            maxWidth: 'none',
            objectFit: 'cover',
            objectPosition: 'left center',
            borderRadius: '8px',
            opacity: showWhite ? 1 : 0,
            transition: 'opacity 0.35s ease-in-out, transform 0.35s ease-in-out',
            transform: showWhite ? 'scale(1)' : 'scale(0.96)',
            pointerEvents: 'none',
          }}
        />
      </div>

      {!hideText && (
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
          <span>mark</span>
          <span style={{ color: showWhite ? '#FFD166' : 'var(--brand-dark)', fontWeight: 900, transition: 'color 0.35s ease-in-out' }}>Pocket</span>
          {subtitle && (
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
          )}
        </span>
      )}
    </div>
  );
};
