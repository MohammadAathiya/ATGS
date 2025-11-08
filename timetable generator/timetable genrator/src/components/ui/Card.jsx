export default function Card({ className = '', title, children, actions }) {
  return (
    <div className={`border rounded-lg p-4 ${className}`}>
      {title && <div className="mb-2 font-medium">{title}</div>}
      {children}
      {actions && <div className="mt-4 flex gap-2">{actions}</div>}
    </div>
  )
}
