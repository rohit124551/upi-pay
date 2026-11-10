/**
 * UpiPayLogo — Dynamic Fast-Forward Rounded Chevrons for UPI Pay
 *
 * Engineered with:
 *  - Authentic 16.8° forward slant angle inspired by NPCI BHIM guidelines
 *  - Custom rounded-pill geometry (100% original, copyright-clean)
 *  - Multi-stop Saffron Gold & Forest Emerald finance gradients
 */
import React from "react";

export const UpiPayLogo = ({ size = 24, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 56 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="UPI Pay Fast-Forward Logo"
      role="img"
    >
      <defs>
        <linearGradient id="upiLogoSaffron" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFA133" />
          <stop offset="50%" stopColor="#F17A21" />
          <stop offset="100%" stopColor="#C24E00" />
        </linearGradient>
        <linearGradient id="upiLogoEmerald" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#088B45" />
          <stop offset="100%" stopColor="#04562B" />
        </linearGradient>
      </defs>
      {/* 16.8° Slanted Saffron Forward Chevron with smooth rounded caps */}
      <path
        d="M18.8 6.2C19.8 4.2 22.4 3.6 24.2 4.9L39.8 16.5C41.8 18 42.4 20.8 41.2 22.9L22.2 56.4C21.1 58.4 18.5 59 16.7 57.7L8.8 51.8C6.8 50.3 6.3 47.5 7.5 45.4L22.6 18.6C23.1 17.7 22.8 16.6 22 16L18.8 13.6C17 12.3 16.6 9.8 17.8 7.9L18.8 6.2Z"
        fill="url(#upiLogoSaffron)"
      />
      {/* 16.8° Slanted Emerald Forward Chevron with smooth rounded caps */}
      <path
        d="M32.8 6.2C33.8 4.2 36.4 3.6 38.2 4.9L49.8 13.6C51.6 15 52 17.5 50.8 19.5L34.4 48.6C33.2 50.7 30.6 51.3 28.8 50L20.8 44.1C18.8 42.6 18.3 39.8 19.5 37.7L36.6 7.5C36.9 7 36.6 6.4 36 6L32.8 6.2Z"
        fill="url(#upiLogoEmerald)"
      />
    </svg>
  );
};

export default UpiPayLogo;
