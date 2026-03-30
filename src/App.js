import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './components/Signup';
import Signin from './components/Signin';
import "bootstrap/dist/css/bootstrap.min.css";
import Getproducts from './components/Getproducts';
import Makepayments from './components/Makepayment';
import Notfound from './components/Notfound';
import FarmHeader from './components/FarmHeader';
import Addproducts from './components/Addproducts';

function App() {
  return (
    <Router>
      <div className="App">

        {/* Header */}
        <header>
          <FarmHeader />

          <nav className="nav-buttons">
            <Link to="/" className="nav-btn home">Home</Link>
            <Link to="/Addproducts" className="nav-btn add">Add products</Link>
            
            <Link to="/signin" className="nav-btn signin">Sign In</Link>
            <Link to="/signup" className="nav-btn signup">Sign Up</Link>
          </nav>
        </header>

        {/* Routes */}
        <Routes>
          <Route path='/' element={<Getproducts />} />
          <Route path='/addproducts' element={<Addproducts />} />
        
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/makepayments' element={<Makepayments />} />
          <Route path='*' element={<Notfound />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;