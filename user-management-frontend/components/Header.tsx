// components/Header.tsx
'use client'

import React from 'react';


const Header = ({ userName }: { userName: string }) => {
  return (
    <div className=" bg-white relative top-0 left-0 right-0 shadow-md z-10 h-[72px] flex justify-between items-center ">
        <header className="w-[1440px] flex justify-between items-center px-4 ">
        <div className="flex items-center ">
            <img src="/Vector.svg" alt="Logo"  />
            {/* <h1 className="text-white text-xl font-bold ml-4">Company Name</h1> */}
        </div>
        <div className="flex space-x-2">
            <div className="flex items-center">
                <img src="/G_Avator_1.svg" alt="Avatar" />
                {/* <h1 className="text-white text-xl font-bold ml-4">Company Name</h1> */}
            </div>
            <div className="text-black text-lg flex items-center ">
                {userName}
            </div>
        </div>
        </header>
    </div>
  );
};

export default Header;

