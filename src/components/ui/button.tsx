import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    return (
      <button
        className={`inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all cursor-pointer hover:font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 px-4 py-2 ${className}`}
        ref={ref}
        suppressHydrationWarning={true}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
