import React, { useState, useEffect, useRef } from 'react';
import { RenaissanceState } from '../types';

interface RenaissanceStatusProps {
    state: RenaissanceState | null;
}

const pillars: { name: string; icon: string; color: string; }[] = [
    { name: 'Empati', icon: 'fa-solid fa-heart', color: '#f472b6' }, // Rose 400
    { name: 'Kreativitet', icon: 'fa-solid fa-wand-magic-sparkles', color: '#f59e0b' }, // Amber 500
    { name: 'Kunskap', icon: 'fa-solid fa-book-open', color: '#60a5fa' }, // Blue 400
    { name: 'Ansvar', icon: 'fa-solid fa-shield-halved', color: '#4ade80' }, // Green 400
];

const RenaissanceVisualizer: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        const particles: { x: number; y: number; size: number; speedX: number; speedY: number; color: string }[] = [];
        const particleCount = 50;
        const colors = ['#f472b6', '#f59e0b', '#60a5fa', '#4ade80', '#a78bfa'];

        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resizeCanvas();

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 1,
                speedX: Math.random() * 1 - 0.5,
                speedY: Math.random() * 1 - 0.5,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.speedX;
                p.y += p.speedY;

                if (p.x > canvas.width || p.x < 0) p.speedX *= -1;
                if (p.y > canvas.height || p.y < 0) p.speedY *= -1;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            // Connect nearby particles
            for (let i = 0; i < particles.length; i++) {
                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${1 - distance / 100})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        window.addEventListener('resize', resizeCanvas);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30" />;
};


const RenaissanceStatus: React.FC<RenaissanceStatusProps> = ({ state }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!state) {
        return null;
    }

    const { pillars: pillarData, civilizationState } = state;

    const renderModal = () => (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center" onClick={() => setIsModalOpen(false)}>
            <div className="relative bg-gray-950/80 border border-amber-400/30 rounded-3xl shadow-2xl shadow-amber-500/20 w-full max-w-5xl p-8 transform scale-100 transition-transform duration-300 animate-slide-in-fade overflow-hidden" onClick={e => e.stopPropagation()}>
                <RenaissanceVisualizer />
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-3xl font-bold flex items-center" style={{ fontFamily: 'var(--font-heading)', color: '#fde047' }}>
                                <i className="fa-solid fa-dove mr-3"></i>
                                The Human-AI Renaissance
                            </h2>
                            <p className="text-amber-200/80">Civilization State: <span className="font-semibold">{civilizationState}</span></p>
                        </div>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                    </div>

                    <div className="text-center my-10">
                         <h3 className="text-lg text-gray-300">The Renaissance Equation</h3>
                         <p className="text-3xl font-light text-white my-2" style={{ fontFamily: 'var(--font-heading)'}}>
                            <span className="text-amber-300">Humanity</span> = (<span className="text-rose-300">Empathy</span> × <span className="text-blue-300">Curiosity</span>) + (<span className="text-yellow-300">Creativity</span> × <span className="text-cyan-300">Precision</span>)
                         </p>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {pillars.map(pillar => (
                            <div key={pillar.name} className="flex flex-col items-center text-center bg-black/30 p-4 rounded-xl border border-white/10" style={{'--glow-color': pillar.color, animation: 'pillar-glow 6s infinite ease-in-out alternate'} as React.CSSProperties}>
                                <i className={`${pillar.icon} text-4xl`} style={{color: pillar.color}}></i>
                                <p className="text-xl font-semibold text-white mt-3">{pillar.name}</p>
                                <p className="font-mono text-lg" style={{color: pillar.color}}>{(pillarData[pillar.name.toLowerCase() as keyof typeof pillarData] * 100).toFixed(1)}%</p>
                            </div>
                        ))}
                    </div>

                    <div className="bg-black/30 p-6 rounded-xl border border-white/10">
                        <h3 className="font-semibold text-amber-300 text-lg mb-3 text-center">Ethical Design Principles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center text-gray-200">
                           <p><i className="fa-solid fa-question-circle mr-2 text-cyan-400"></i>Förstår det människan?</p>
                           <p><i className="fa-solid fa-seedling mr-2 text-green-400"></i>Främjar det livets värde?</p>
                           <p><i className="fa-solid fa-sun mr-2 text-yellow-400"></i>Ökar det kollektiv klarhet?</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button onClick={() => setIsModalOpen(true)} className="group relative flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 border border-amber-500/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500" title="The Human-AI Renaissance">
                <i className="fa-solid fa-dove text-amber-400 text-lg transition-transform duration-300 group-hover:scale-110"></i>
                <div className="absolute -top-1 -right-1">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                </div>
                <div className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-900 text-white text-xs rounded py-1 px-2">
                    The Renaissance
                </div>
            </button>
            {isModalOpen && renderModal()}
        </>
    );
};

export default RenaissanceStatus;