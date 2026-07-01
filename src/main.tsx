// import { StrictMode } from 'react'




import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from 'react-hot-toast';
const qc = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
<QueryClientProvider client={qc}>
  <Toaster position="top-right" />
  <App />
</QueryClientProvider>
  </StrictMode>,
)
