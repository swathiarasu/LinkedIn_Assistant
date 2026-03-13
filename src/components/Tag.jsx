import './Tag.css'

const COLORS = ['purple', 'teal', 'coral', 'blue', 'amber', 'gray']

export default function Tag({ children, color = 'blue', index }) {
  const c = index !== undefined ? COLORS[index % COLORS.length] : color
  return <span className={`tag tag-${c}`}>{children}</span>
}
