import React, { useRef, useEffect } from 'react';

const ElectricBorder = ({ children, color = '#00FFFF', speed = 1, thickness = 2, chaos = 0.0, style = {} }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        const resize = () => {
            const rect = container.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height;
        };

        const draw = () => {
            if (!ctx || !canvas) return;
            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);
            ctx.lineWidth = thickness;
            ctx.lineJoin = 'round';
            ctx.strokeStyle = color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;

            const path = new Path2D();

            // Generate irregular border
            const segments = (width + height) / 10; // Density
            const step = width / (width / 10);

            // Simple animated rect for now to save perf, can add chaos logic if needed
            // Actually, let's just do a glowy pulsing border for "Electric" feel

            // Top
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(width, 0);
            ctx.lineTo(width, height);
            ctx.lineTo(0, height);
            ctx.closePath();

            // Add some noise based on time
            const offset = Math.sin(time * speed) * 5;

            ctx.stroke();

            time += 0.05;
            animationFrameId = requestAnimationFrame(draw);
        };

        resize();
        window.addEventListener('resize', resize);
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, speed, thickness]);

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block', ...style }}>
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    pointerEvents: 'none',
                    zIndex: 1,
                    filter: `blur(${chaos * 2}px)`
                }}
            />
            <div style={{ position: 'relative', zIndex: 2 }}>
                {children}
            </div>
        </div>
    );
};

export default ElectricBorder;
