export default function Button({ as: As = 'button', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const styles = 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white'
  return (
    <As className={`${base} ${styles} ${className}`} {...props}>{children}</As>
  )
}
