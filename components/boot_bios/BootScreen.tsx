'use client';

import React from 'react';
import Image from 'next/image';

const BootScreen: React.FC = () => {
  return (
    <div className="boot-screen">
      {/* Capa de textura en rejilla */}
      <div className="grid-texture">
        {/* Contenedor que centra todo en columna */}
        <div className="boot-screen__container">
          <Image 
            src="logo-skynet-con-slogan.png" 
            alt="Skynet Logo" 
            className="boot-screen__logo" 
            width={350} 
            height={350} 
          />
          {/* Contenedor glitch-wrapper: aquí va texto, barra de progreso, etc. */}
          <div className="glitch-wrapper">
            <div className="boot-screen__subtitle">STARTING SYSTEM...</div>
            <div className="boot-screen__progress-bar">
              <div className="boot-screen__progress"></div>
            </div>
            <div className="boot-screen__loading">LOADING...</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BootScreen;
