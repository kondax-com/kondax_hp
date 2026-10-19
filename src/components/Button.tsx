import { Link } from '@/i18n/routing'
import clsx from 'clsx'

type ButtonProps = {
  invert?: boolean
  ariaLabel?: string
} & (
  | React.ComponentPropsWithoutRef<typeof Link>
  | (React.ComponentPropsWithoutRef<'button'> & { href?: undefined })
)

export function Button({
  invert = false,
  className,
  children,
  ariaLabel,
  'aria-label': ariaLabelProp,
  ...props
}: ButtonProps) {
  className = clsx(
    className,
    'inline-flex rounded-full px-4 py-1.5 text-sm font-semibold transition',
    invert
      ? 'bg-white text-neutral-950 hover:bg-neutral-200'
      : 'bg-neutral-950 text-white hover:bg-neutral-800',
  )

  let inner = <span className="relative top-px">{children}</span>

  if (typeof props.href === 'undefined') {
    return (
      <button
        className={className}
        {...props}
        aria-label={ariaLabelProp ?? ariaLabel}
      >
        {inner}
      </button>
    )
  }

  return (
    <Link className={className} {...props} aria-label={ariaLabelProp ?? ariaLabel}>
      {inner}
    </Link>
  )
}
