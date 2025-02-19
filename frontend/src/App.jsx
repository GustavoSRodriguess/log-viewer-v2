import LogViewer from './components/LogViewer'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
        <LogViewer />
    </ThemeProvider>
  )
}

export default App