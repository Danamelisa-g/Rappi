'use client';

import { useEffect } from 'react';
export default function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [message]);


  return (
    <div className="toast" role="alert" onClick={onClose}>
      {message}
    </div>
  );
}

