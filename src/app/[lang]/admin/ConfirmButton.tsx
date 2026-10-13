'use client'

// Submit button that asks for confirmation first.
export default function ConfirmButton({
  question,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { question: string }) {
  return (
    <button
      type="submit"
      {...props}
      className={className}
      onClick={(event) => {
        if (!window.confirm(question)) event.preventDefault()
      }}
    />
  )
}
