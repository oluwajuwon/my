import React from "react";

type CommonFieldProps = {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  action?: React.ReactNode;
};

type TextFieldProps = CommonFieldProps & React.InputHTMLAttributes<HTMLInputElement>;

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, hint, error, action, className = "", ...inputProps }, ref) => (
    <label className={`vela-field ${error ? "has-error" : ""} ${className}`.trim()}>
      <span className="vela-field-label">
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </span>
      <span className="vela-field-control">
        <input ref={ref} aria-invalid={Boolean(error)} {...inputProps} />
        {action}
      </span>
      {error && <span className="vela-field-error">{error}</span>}
    </label>
  ),
);

TextField.displayName = "TextField";

type SelectFieldProps = CommonFieldProps & React.SelectHTMLAttributes<HTMLSelectElement>;

export const SelectField: React.FC<SelectFieldProps> = ({ label, hint, error, children, className = "", ...selectProps }) => (
  <label className={`vela-field ${error ? "has-error" : ""} ${className}`.trim()}>
    <span className="vela-field-label">
      <span>{label}</span>
      {hint && <small>{hint}</small>}
    </span>
    <span className="vela-field-control">
      <select aria-invalid={Boolean(error)} {...selectProps}>{children}</select>
    </span>
    {error && <span className="vela-field-error">{error}</span>}
  </label>
);
