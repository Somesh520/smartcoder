import React, { useState } from 'react';
import { Star, X, Send, Heart } from 'lucide-react';
import { submitReview } from '../api';

const ReviewModal = ({ isOpen, onClose, userInfo, onReviewSubmitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (rating === 0) {
            setError("Please select a rating!");
            return;
        }
        if (!comment.trim()) {
            setError("Please write a small review!");
            return;
        }

        setLoading(true);
        setError('');

        try {
            await submitReview(rating, comment);
            setSubmitted(true);
            setTimeout(() => {
                onReviewSubmitted();
                onClose();
                setSubmitted(false);
                setRating(0);
                setComment('');
            }, 2000);
        } catch (err) {
            setError(err.message || "Failed to submit review");
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
            zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{
                background: '#1e1e2e', padding: '30px', borderRadius: '24px',
                width: '400px', border: '1px solid rgba(167,139,250,0.2)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative',
                animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                {submitted ? (
                    <div style={{ textAlign: 'center', padding: '20px 0', animation: 'fadeIn 0.5s' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(236, 72, 153, 0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
                        }}>
                            <Heart size={40} fill="#ec4899" color="#ec4899" style={{ animation: 'pulse 1s infinite' }} />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '10px' }}>Thank You!</h2>
                        <p style={{ color: '#a1a1aa' }}>Your feedback means a lot to us. ❤️</p>
                    </div>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', color: '#fff' }}>Rate Your Experience</h2>
                            <p style={{ margin: '5px 0 0', color: '#9ca3af', fontSize: '14px' }}>How are you finding SmartCoder?</p>
                        </div>

                        {/* User Info Preview */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
                            <img
                                src={userInfo.photos || userInfo.photoURL || "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"}
                                alt={userInfo.displayName}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid #a78bfa', objectFit: 'cover' }}
                            />
                            <span style={{ color: '#e5e7eb', fontWeight: 600 }}>{userInfo.displayName}</span>
                        </div>

                        {/* Star Rating */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '20px' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', transform: (hoverRating || rating) >= star ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s' }}
                                >
                                    <Star
                                        size={32}
                                        fill={(hoverRating || rating) >= star ? " #fbbf24" : "transparent"}
                                        color={(hoverRating || rating) >= star ? "#fbbf24" : "#4b5563"}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Comment Box */}
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us what you liked..."
                            style={{
                                width: '100%', height: '100px', background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(167,139,250,0.2)', borderRadius: '12px',
                                padding: '12px', color: '#fff', fontSize: '14px', outline: 'none',
                                resize: 'none', marginBottom: '15px'
                            }}
                        />

                        {error && <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', marginBottom: '15px' }}>{error}</p>}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                width: '100%', padding: '12px', background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                                border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 700,
                                cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Submitting...' : <><Send size={18} /> Submit Review</>}
                        </button>
                    </>
                )}
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                    100% { transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default ReviewModal;
