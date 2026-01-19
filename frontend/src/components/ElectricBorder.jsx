import React, { useRef, useEffect } from 'react';

const ElectricBorder = ({
    color = '#7df9ff',
    speed = 1,
    chaos = 0.12,
    thickness = 2,
    style = {},
    children
}) => {
    const filterRef = useRef(null);
    const timeRef = useRef(0);
    const reqRef = useRef(null);

    useEffect(() => {
        const animate = () => {
            if (filterRef.current) {
                timeRef.current += speed * 0.005;
                // Animate the baseFrequency to create the crackling electric effect
                // We oscillate the frequency slightly or just move the seed/rendering
                // feTurbulence doesn't have a 'time' attribute, but we can change seed or baseFrequency.
                // Changing seed is too abrupt. Changing baseFrequency is smooth.

                // We use two numbers for baseFrequency (x y). 
                // 'chaos' controls the magnitude.
                // We'll vary it slightly over time.

                const bfX = chaos + Math.sin(timeRef.current) * (chaos * 0.5);
                const bfY = chaos + Math.cos(timeRef.current) * (chaos * 0.5);

                filterRef.current.setAttribute('baseFrequency', `${bfX} ${bfY}`);
                filterRef.current.setAttribute('seed', Math.round(timeRef.current * 10) % 100);
            }
            reqRef.current = requestAnimationFrame(animate);
        };

        reqRef.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(reqRef.current);
    }, [speed, chaos]);

    const id = `electric-filter-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div style={{ position: 'relative', display: 'inline-block', ...style }}>
            {/* The Glow/Border Layer */}
            <svg
                style={{
                    position: 'absolute',
                    top: -thickness * 2,
                    left: -thickness * 2,
                    width: `calc(100% + ${thickness * 4}px)`,
                    height: `calc(100% + ${thickness * 4}px)`,
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
            >
                <defs>
                    <filter id={id} x="-20%" y="-20%" width="140%" height="140%">
                        <feTurbulence
                            ref={filterRef}
                            type="fractalNoise"
                            baseFrequency={chaos}
                            numOctaves="4"
                            stitchTiles="stitch"
                            result="noise"
                        />
                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale={thickness * 3} // Distortion amount relative to thickness
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                        {/* Add a glow effect */}
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                <rect
                    x={thickness * 2}
                    y={thickness * 2}
                    width={`calc(100% - ${thickness * 4}px)`}
                    height={`calc(100% - ${thickness * 4}px)`}
                    rx={style.borderRadius || 0}
                    ry={style.borderRadius || 0}
                    fill="none"
                    stroke={color}
                    strokeWidth={thickness}
                    // Apply the filter
                    filter={`url(#${id})`}
                    style={{
                        vectorEffect: 'non-scaling-stroke'
                    }}
                />

                {/* Secondary stronger stroke for core */}
                <rect
                    x={thickness * 2}
                    y={thickness * 2}
                    width={`calc(100% - ${thickness * 4}px)`}
                    height={`calc(100% - ${thickness * 4}px)`}
                    rx={style.borderRadius || 0}
                    ry={style.borderRadius || 0}
                    fill="none"
                    stroke={color}
                    strokeWidth={thickness / 2}
                    opacity="0.8"
                />

            </svg>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {children}
            </div>
        </div>
    );
};

export default ElectricBorder;
