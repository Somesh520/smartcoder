import React from 'react';
import { useNavigate } from 'react-router-dom';
import LeetCodeStats from './LeetCodeStats';
import SEO from './SEO';

const LeetCodePage = () => {
    const navigate = useNavigate();

    const handleSelectProblem = (problem) => {
        // Navigate to workspace with the problem, using slug as ID
        const problemId = problem.slug || problem.id;
        navigate(`/app/workspace/${problemId}`, {
            state: {
                selectedProblem: problem,
                from: 'stats'
            }
        });
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-main)', paddingTop: '40px', paddingBottom: '80px' }}>
            <SEO
                title="LeetCode Stats - AlgoDuel"
                description="Track your LeetCode progress, streaks, and contribution graph on AlgoDuel."
            />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
                <LeetCodeStats onSelectProblem={handleSelectProblem} />
            </div>
        </div>
    );
};

export default LeetCodePage;
