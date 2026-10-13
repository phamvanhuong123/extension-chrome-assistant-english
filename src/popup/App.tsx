import './App.css'

function App() {
  return (
    <div className='popup-container'>
      <header className='popup-header'>
        <h1 className='popup-title'>English Reading Assistant</h1>
      </header>
      <main className='popup-body'>
        <p style={{ margin: 0, color: 'var(--color-text-secondary)', font: 'var(--text-body)' }}>
          Bôi đen bất kỳ từ tiếng Anh nào trên trang web để tra từ và lưu từ vựng.
        </p>
      </main>
    </div>
  )
}

export default App
