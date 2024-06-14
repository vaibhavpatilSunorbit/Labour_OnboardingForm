// import React from 'react';
// import './Header.css'; 
// import VJLogo from "../../images/VJlogo-1-removebg.png"
// import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
// import LogoutIcon from '@mui/icons-material/Logout';
// import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// function Header() {
//   return (
//     <div className="header">
//       <div className="logo-container">
//         <img src={VJLogo} alt="Logo" className="logo" />
//       </div>
//       <div className="options">
//         <NotificationsActiveIcon className='icon'/>
//         <LogoutIcon className='icon'/>
//         <AccountCircleIcon className='icon'/>

       
//       </div>
//     </div>
//   );
// }

// export default Header;


import React from 'react'
import {BsFillBellFill,BsIconName , BsFillEnvelopeFill, BsPersonCircle, BsSearch, BsJustify}
 from 'react-icons/bs';
 import { BiLogOut } from 'react-icons/bi';
 import VJLogo from "../../images/VJlogo-1-removebg.png";

function Header({OpenSidebar}) {
  return (
    <header className='header'>
        <div className='menu-icon'>
            <BsJustify className='icon' onClick={OpenSidebar}/>
        </div>
        <div className='header-left'>
            <img src={VJLogo} className="vjlogo" alt="logo"/>
            
        </div>
        <div className='header-right' className="headericon">
            <BsFillBellFill className='icon'/>
            <BiLogOut className='icon'/>
            <BsPersonCircle className='icon'/>
        </div>
    </header>
  )
}

export default Header;










