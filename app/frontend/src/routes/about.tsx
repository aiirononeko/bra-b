import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/about')({
  component: About,
})

function About() {
  return (
    <div className="p-2">
      <h3>Aboutページ</h3>
      <p>このアプリケーションについての説明ページです。</p>
    </div>
  )
}
