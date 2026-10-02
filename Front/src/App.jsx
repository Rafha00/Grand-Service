
import './App.css'
import { Routes, Route } from 'react-router-dom'
import ProductShow from './page/ProductShow.jsx'

function App() {
 

  return (
  <div>

    <Routes>
       
         <Route path="/product" element={< ProductShow/>} />
       
      </Routes>

  </div>
  )
}

export default App
