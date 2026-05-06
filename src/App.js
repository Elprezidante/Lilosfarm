import React, { useState, useEffect } from 'react'; // 1. Added hooks
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
import ContactUs from './components/Contact us';

function App() {
  // 2. State to track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // 3. Check localStorage for a token/user on mount
    const token = localStorage.getItem('token'); 
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  // 4. Logout function to clear the state
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    window.location.href = '/'; // Redirect to home
  };

  return (
    <Router>
      <div className="App">
        <header>
          <FarmHeader />

          <nav className="nav-buttons">
            <Link to="/" className="nav-btn home">Home</Link>
            <Link to="/Addproducts" className="nav-btn add">Add products</Link>
            <Link to="/Contactus" className='nav-btn signup'>Contact us</Link>

            {/* 5. Conditional Rendering Logic */}
            {!isLoggedIn ? (
              <>
                <Link to="/signin" className="nav-btn signin">Sign In</Link>
                <Link to="/signup" className="nav-btn signup">Sign Up</Link>
              </>
            ) : (
              <button onClick={handleLogout} className="nav-btn logout">Logout</button>
            )}
          </nav>
        </header>

        <Routes>
          <Route path='/' element={<Getproducts />} />
          <Route path='/addproducts' element={<Addproducts />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/signin' element={<Signin />} />
          <Route path='/makepayments' element={<Makepayments />} />
          <Route path='/Contactus' element={<ContactUs/>}/>
          <Route path='*' element={<Notfound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;