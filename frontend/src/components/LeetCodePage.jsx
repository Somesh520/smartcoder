import React from 'react';
import LeetCodeStats from './LeetCodeStats';
import SEO from './SEO';

const LeetCodePage = () => {
    return (
        <div style={{ minHeight: '100vh', background: '#000', paddingTop: '40px', paddingBottom: '80px' }}>
            <SEO
                title="LeetCode Stats - AlgoDuel"
                description="Track your LeetCode progress, streaks, and contribution graph on AlgoDuel."
            />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <LeetCodeStats />
            </div>
        </div>
    );
};

export default LeetCodePage;
