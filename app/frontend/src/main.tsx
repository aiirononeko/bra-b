import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import './index.css'

// 生成されたルートツリーをインポート
import { routeTree } from './routeTree.gen'

// ルーターインスタンスの作成
const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
})

// 型安全のためにルーターインスタンスを登録
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>,
  )
}
