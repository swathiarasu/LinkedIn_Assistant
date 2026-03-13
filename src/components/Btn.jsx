import './Btn.css'

export default function Btn({ children, onClick, disabled, primary, small, ghost }) {
  const cls = ['btn', primary ? 'btn-primary' : ghost ? 'btn-ghost' : 'btn-default', small ? 'btn-small' : ''].filter(Boolean).join(' ')
  return (
    <button className={cls} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
