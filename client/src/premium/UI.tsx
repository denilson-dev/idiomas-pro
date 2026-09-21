import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export function Surface({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`surface ${className}`}>{children}</div>;
}

export function Pill({
  children,
  tone = 'purple',
}: {
  children: ReactNode;
  tone?: 'purple' | 'pink' | 'teal' | 'orange' | 'neutral' | 'danger';
}) {
  return <span className={`pill pill--${tone}`}>{children}</span>;
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button button--${variant} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function Stat({
  label,
  value,
  sub,
  tone = 'purple',
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: 'purple' | 'pink' | 'teal' | 'orange';
}) {
  return (
    <Surface className={`stat stat--${tone}`}>
      <div className="stat__orb" />
      <strong>{value}</strong>
      <span>{label}</span>
      {sub && <small>{sub}</small>}
    </Surface>
  );
}

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Surface className="modal">
        <div className="modal__head">
          <div>
            <small>Idiomas Pro</small>
            <h2>{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        {children}
      </Surface>
    </div>
  );
}

export function Toast({ message, tone = 'success' }: { message: string; tone?: 'success' | 'error' }) {
  if (!message) return null;

  return (
    <div className={`toast toast--${tone}`}>
      {tone === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
      <span>{message}</span>
    </div>
  );
}

export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Surface className="empty">
      <div className="empty__icon">✦</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </Surface>
  );
}
