import React, { useState, useEffect } from 'react';
import { fetchEvents, createEvent, deleteEvent, fetchGoogleCalendar, createGoogleEvent, deleteGoogleEvent } from '../api';
import { ChevronLeft, ChevronRight, Clock, MapPin, Plus, Trash2, Calendar as CalIcon, Cloud } from 'lucide-react';
import CyberLoader from './CyberLoader';

const CalendarPage = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [googleConnected, setGoogleConnected] = useState(false);

    // Modal Form State
    const [showModal, setShowModal] = useState(false);
    const [newEventTitle, setNewEventTitle] = useState("");
    const [newEventDate, setNewEventDate] = useState("");
    const [newEventTime, setNewEventTime] = useState("");
    const [newEventType, setNewEventType] = useState("other");
    const [syncGoogle, setSyncGoogle] = useState(false);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        try {
            // Fetch Local
            const localEvents = await fetchEvents();
            let allEvents = Array.isArray(localEvents) ? localEvents : [];

            // Fetch Google
            try {
                const googleEvents = await fetchGoogleCalendar();
                if (googleEvents && Array.isArray(googleEvents)) {
                    setGoogleConnected(true);
                    const formattedGoogle = googleEvents.map(e => ({
                        _id: e.id,
                        title: e.title,
                        startTime: e.start,
                        endTime: e.end,
                        type: 'google',
                        source: 'google'
                    }));
                    allEvents = [...allEvents, ...formattedGoogle];
                } else {
                    setGoogleConnected(false);
                }
            } catch (err) {
                setGoogleConnected(false);
            }

            setEvents(allEvents);
        } catch (e) {
            console.error(e);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectGoogle = () => {
        window.location.href = "http://localhost:3000/auth/google/tasks";
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // ... (rest of logic same as before, simplified for this replace check) ...
            if (!newEventTitle.trim()) { alert("Title required"); setLoading(false); return; }

            const start = new Date(`${newEventDate}T${newEventTime}`);
            const end = new Date(start.getTime() + 60 * 60 * 1000);

            if (googleConnected && syncGoogle) {
                await createGoogleEvent({ title: newEventTitle, startTime: start, endTime: end });
            } else {
                await createEvent({ title: newEventTitle, startTime: start, endTime: end, type: newEventType });
            }

            setShowModal(false);
            setNewEventTitle("");
            setNewEventDate("");
            setNewEventTime("");
            setSyncGoogle(false);
            await loadEvents(); // loadEvents handles loading state, but we set true at start of this
        } catch (e) {
            alert("Failed to create event");
            setLoading(false);
        }
    };

    const handleDelete = async (event) => {
        if (!window.confirm("Delete event?")) return;
        setLoading(true);
        try {
            if (event.source === 'google') {
                await deleteGoogleEvent(event._id);
            } else {
                await deleteEvent(event._id);
            }
            await loadEvents();
        } catch (e) {
            alert("Failed to delete event");
            setLoading(false);
        }
    };

    // --- MONTH LOGIC ---
    const getMonthDays = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const daysInMonth = lastDayOfMonth.getDate();
        const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday

        const days = [];
        // Empty slots for previous month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }
        // Days of current month
        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(year, month, i));
        }
        return days;
    };

    const monthDays = getMonthDays(currentDate);
    const weekDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const getEventsForDay = (date) => {
        if (!date) return [];
        return events.filter(e => new Date(e.startTime).toDateString() === date.toDateString());
    };

    return (
        <div style={{ padding: '40px', color: 'white', height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <h1 className="animate-fade-in" style={{ fontSize: '32px', fontWeight: '800', background: 'linear-gradient(to right, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                    </h1>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} style={{ background: '#27272a', border: '1px solid #3f3f46', color: 'white', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronLeft size={20} /></button>
                        <button onClick={() => setCurrentDate(new Date())} style={{ background: '#27272a', border: '1px solid #3f3f46', color: 'white', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Today</button>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} style={{ background: '#27272a', border: '1px solid #3f3f46', color: 'white', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><ChevronRight size={20} /></button>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    style={{ background: 'var(--accent-green)', color: 'black', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', gap: '8px', alignItems: 'center', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)', transition: 'transform 0.2s', fontSize: '14px' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <Plus size={20} /> Add Event
                </button>
            </div>

            {loading && <CyberLoader />}

            {/* MONTH GRID CONTAINER */}
            <div className="glass-panel animate-scale-in" style={{ flex: 1, borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid rgba(255,255,255,0.05)' }}>
                {/* Header Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {weekDayNames.map(day => (
                        <div key={day} style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#a1a1aa', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days Grid */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(100px, 1fr)', overflowY: 'auto' }}>
                    {monthDays.map((day, i) => {
                        if (!day) return <div key={i} style={{ background: 'rgba(0,0,0,0.1)', borderRight: '1px solid rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.02)' }}></div>;

                        const isToday = new Date().toDateString() === day.toDateString();
                        const dayEvents = getEventsForDay(day);

                        const handleDayClick = () => {
                            setNewEventDate(day.toISOString().split('T')[0]);
                            setShowModal(true);
                        };

                        return (
                            <div
                                key={i}
                                className="day-cell"
                                onClick={handleDayClick}
                                style={{
                                    padding: '8px',
                                    borderRight: '1px solid rgba(255,255,255,0.03)',
                                    borderBottom: '1px solid rgba(255,255,255,0.03)',
                                    background: isToday ? 'rgba(34, 197, 94, 0.05)' : 'transparent',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    minHeight: '100px'
                                }}
                                onMouseEnter={e => !isToday && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                onMouseLeave={e => !isToday && (e.currentTarget.style.background = 'transparent')}
                            >
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                                    <span style={{
                                        width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                                        background: isToday ? 'var(--accent-green)' : 'transparent',
                                        color: isToday ? 'black' : '#e4e4e7',
                                        fontWeight: isToday ? 'bold' : 'normal',
                                        fontSize: '14px',
                                        boxShadow: isToday ? '0 0 10px rgba(34,197,94,0.4)' : 'none'
                                    }}>
                                        {day.getDate()}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {dayEvents.map((ev, idx) => (
                                        <div key={ev._id} className="animate-slide-up" style={{
                                            animationDelay: `${idx * 0.05}s`,
                                            background: ev.type === 'exam' ? 'rgba(239, 68, 68, 0.15)' : ev.type === 'class' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                                            color: ev.type === 'exam' ? '#fca5a5' : ev.type === 'class' ? '#93c5fd' : '#86efac',
                                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '500',
                                            borderLeft: `2px solid ${ev.type === 'exam' ? '#ef4444' : ev.type === 'class' ? '#3b82f6' : '#22c55e'}`,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            backdropFilter: 'blur(4px)',
                                            transition: 'transform 0.1s'
                                        }}
                                            onClick={(e) => { e.stopPropagation(); /* Prevent modal, handled by cell click or maybe delete? Let's just stop prop for delete btn */ }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{ev.title}</span>
                                            {ev.type !== 'class' && <button onClick={(e) => { e.stopPropagation(); handleDelete(ev); }} style={{ background: 'none', border: 'none', color: 'inherit', padding: 0, opacity: 0.7, marginLeft: '4px' }}><Trash2 size={10} /></button>}
                                        </div>
                                    ))}
                                    {dayEvents.length > 3 && <div style={{ fontSize: '10px', color: '#a1a1aa', paddingLeft: '4px' }}>+ {dayEvents.length - 3} more</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="animate-fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', zIndex: 100 }}>
                    <div className="glass-panel animate-scale-in" style={{ background: '#18181b', padding: '30px', borderRadius: '24px', width: '400px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                        <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>Add Event</h2>
                        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input required placeholder="Event Title" value={newEventTitle} onChange={e => setNewEventTitle(e.target.value)} style={{ padding: '14px', borderRadius: '12px', background: '#27272a', border: '1px solid #3f3f46', color: 'white', fontSize: '16px', outline: 'none' }} />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input required type="date" value={newEventDate} onChange={e => setNewEventDate(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#27272a', border: '1px solid #3f3f46', color: 'white' }} />
                                <input required type="time" value={newEventTime} onChange={e => setNewEventTime(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#27272a', border: '1px solid #3f3f46', color: 'white' }} />
                            </div>
                            <select value={newEventType} onChange={e => setNewEventType(e.target.value)} style={{ padding: '12px', borderRadius: '12px', background: '#27272a', border: '1px solid #3f3f46', color: 'white' }}>
                                <option value="class">Class</option>
                                <option value="exam">Exam</option>
                                <option value="study">Study</option>
                                <option value="assignment">Assignment</option>
                                <option value="other">Other</option>
                            </select>

                            {googleConnected && (
                                <div
                                    onClick={() => setSyncGoogle(!syncGoogle)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        background: syncGoogle ? 'rgba(66, 133, 244, 0.2)' : '#27272a',
                                        border: syncGoogle ? '1px solid #4285F4' : '1px solid #3f3f46',
                                        padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: '0.2s'
                                    }}
                                >
                                    <Cloud size={18} color={syncGoogle ? '#4285F4' : 'white'} />
                                    <span style={{ fontSize: '14px', fontWeight: '500' }}>Save to Google Calendar</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', color: '#a1a1aa', border: '1px solid #3f3f46', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'var(--accent-green)', color: 'black', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 12px rgba(34, 197, 94, 0.2)' }}>Add Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
