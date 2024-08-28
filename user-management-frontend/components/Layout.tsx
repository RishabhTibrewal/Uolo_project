"use client"

import React from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import UserCard from './UserCard';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col relative min-h-screen ">
      <Header userName={'vtbjotbt'} />
      <div className="flex flex-1 relative h-[100%]  ">
        <Sidebar />
        <main className="w-[100%] bg-gray-100 relative  ">
          {children}
        </main>
        {/* <UserCard user={null} onDelete={function (id: number): void {
          throw new Error('Function not implemented.');
        } }/> */}
      </div>
    </div>
  );
};

export default Layout;