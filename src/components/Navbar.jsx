import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <div className="navbar noselect" style={{ display: 'flex', alignItems: 'center', gap: '2rem', height: "4rem" }}>
      <div className='logo' onClick={() => navigate('/')} style={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '2rem' }}>
        PropMall
      </div>
      <div className='menu' style={{ display: 'flex', gap: '1rem' }}>
        <div className='active' style={{ fontWeight: 'bold' }}>Home</div>
        <div>For Sale</div>
        <div>For Rent</div>
      </div>
    </div>
  );
}
