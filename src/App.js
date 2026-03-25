import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Signup from './components/Signup';
import Signin from './components/Signin';
import "bootstrap/dist/css/bootstrap.min.css";
import Addproducts from './components/Addproducts';
import Getproducts from './components/Getproducts';
import Makepayments from './components/Makepayment';
import Notfound from './components/Notfound';

function App() {
  return (
    <Router>
      <div className="App">
      <header className="App-header">
        <h1 className='Welcoming'>Welcome To Lilos Farm -for farm fresh produces</h1>
     <nav className="d-flex justify-content-end mt-2">
  <Link to="/"><button className="navbar-btn"><span>Home</span></button></Link>
  <Link to="/addproducts"><button className="navbar-btn"><span>Add Products</span></button></Link>
  <Link to="/signin"><button className="navbar-btn"><span>Sign In</span></button></Link>
  <Link to="/signup"><button className="navbar-btn"><span>Sign Up</span></button></Link>
</nav>
 </header>
      <Routes>
        < Route path='/' element={<Getproducts />} />
         <Route path='/addproducts' element={<Addproducts />} />
         <Route path='/signup' element={<Signup/>} />
          <Route path='/signin' element={<Signin />} />
                <Route path='/makepayments' element={<Makepayments/>} />
                 <Route path='*' element={<Notfound />} />
      </Routes>
    </div>
    </Router>
  );
}

export default App;
