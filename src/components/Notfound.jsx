import React from 'react'
import "../css/Notfound.css"
import Footer from './FarmFooter';
const Notfound = () => {
  return (
    <div className='Notfound'>
      <h1>WHY! ARE YOU RUNNING</h1>
       <h1>OOOPS! page not found</h1>
      <h1>404 not found</h1>
      <a href="/">Back Home</a> 
      <Footer/>    
    </div>
  )
}

export default Notfound;
