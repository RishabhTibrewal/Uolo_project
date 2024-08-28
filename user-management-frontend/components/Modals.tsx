'use client'

import React, { useEffect, useRef } from 'react';

interface SuccessModalProps{
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const SuccessModal = ({ isOpen, onClose, message }: SuccessModalProps) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
        <div className="mb-4">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        <p className="text-xl font-semibold text-gray-800">{message}</p>
      </div>
    </div>
  );
};

export default SuccessModal;