
import { useState, useEffect } from 'react';

const MouseFollower = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsActive(true);
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isActive) return null;

  return (
    <div
      className="fixed pointer-events-none z-50 opacity-70 transition-transform duration-300"
      style={{
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255, 69, 0, 0.4) 0%, rgba(18, 18, 18, 0) 70%)',
        transform: `translate(${mousePosition.x - 150}px, ${mousePosition.y - 150}px)`,
      }}
    />
  );
};

export default MouseFollower;
