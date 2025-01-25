import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

function HomePage() {
  const navigate = useNavigate();
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Initial state
    gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], {
      opacity: 0,
      y: 50
    });

    // Animation sequence
    tl.to(containerRef.current, {
      duration: 1,
      opacity: 1,
      ease: "power3.out"
    })
    .to(titleRef.current, {
      duration: 1,
      opacity: 1,
      y: 0,
      ease: "back.out(1.7)"
    })
    .to(subtitleRef.current, {
      duration: 1,
      opacity: 1,
      y: 0,
      ease: "back.out(1.7)"
    }, "-=0.5")
    .to(buttonsRef.current, {
      duration: 1,
      opacity: 1,
      y: 0,
      ease: "back.out(1.7)"
    }, "-=0.5");
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: "url('/bg.jpg')",
        opacity: 0
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 
          ref={titleRef}
          className="text-6xl md:text-8xl font-extrabold text-white mb-4 tracking-tight"
        >
          WAVE
        </h1>
        
        <p 
          ref={subtitleRef}
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          Connect and chat with friends in real-time. Experience communication reimagined.
        </p>

        <div 
          ref={buttonsRef}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 text-lg font-medium rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
          >
            Get Started
          </button>
          
          <button
            className="px-8 py-3 text-lg font-medium rounded-full bg-transparent border-2 border-white text-white hover:bg-white/10 transition-colors duration-300 transform hover:scale-105"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Animated background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-black/20 z-[-1]"></div>
    </div>
  );
}

export default HomePage;