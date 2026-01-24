import React, { useState, useEffect } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask, fetchGoogleTasks, createGoogleTask, deleteGoogleTask } from '../api';
import { Plus, Trash2, CheckCircle, Circle, RefreshCw, Link as LinkIcon, Cloud } from 'lucide-react';
import CyberLoader from './CyberLoader';

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [googleConnected, setGoogleConnected] = useState(false);

    // New Task Form
    const [newTask, setNewTask] = useState("");
    const [newTaskDeadline, setNewTaskDeadline] = useState("");
    const [newTaskPriority, setNewTaskPriority] = useState("medium");
    const [syncGoogle, setSyncGoogle] = useState(false);

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        setLoading(true);
        try {
            // Always fetch local tasks
            const localTasks = await fetchTasks();
            let allTasks = Array.isArray(localTasks) ? localTasks : [];

            // Try fetching Google Tasks (it might fail if not connected)
            try {
                const googleTasks = await fetchGoogleTasks();
                if (googleTasks === null) {
                    setGoogleConnected(false);
                } else if (Array.isArray(googleTasks)) {
                    setGoogleConnected(true);
                    allTasks = [...allTasks, ...googleTasks];
                }
            } catch (err) {
                // Not connected or error, just ignore google tasks
                setGoogleConnected(false);
            }

            setTasks(allTasks);
        } catch (e) {
            console.error(e);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConnectGoogle = () => {
        // Redirect to incremental auth route
        window.location.href = "http://localhost:3000/auth/google/tasks";
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) {
            alert("Please enter a task title");
            return;
        }

        setLoading(true);
        try {
            // IF Google Sync is ON: Create ONLY on Google
            if (googleConnected && syncGoogle) {
                const res = await createGoogleTask({
                    title: newTask,
                    deadline: newTaskDeadline || undefined
                });

                if (res.error) {
                    alert(`Google Error: ${res.error}. Please reconnect Google.`);
                    setGoogleConnected(false);
                }
            } else {
                // ELSE: Create Local Task in MongoDB
                await createTask({
                    title: newTask,
                    deadline: newTaskDeadline || undefined,
                    priority: newTaskPriority
                });
            }

            setNewTask("");
            setNewTaskDeadline("");
            setSyncGoogle(false);
            await loadTasks();
        } catch (e) {
            alert("Failed to create task");
            console.error(e);
            setLoading(false);
        }
    };

    const toggleStatus = async (task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        try {
            // Optimistic update
            const updatedTasks = tasks.map(t => t._id === task._id ? { ...t, status: newStatus } : t);
            setTasks(updatedTasks);

            await updateTask(task._id, { status: newStatus });
            loadTasks(); // Sync fully
        } catch (e) {
            alert("Update failed");
            loadTasks(); // Revert
        }
    };

    const handleDelete = async (task) => {
        if (!window.confirm("Delete task?")) return;
        setLoading(true);
        try {
            if (task.source === 'google') {
                await deleteGoogleTask(task.id);
            } else {
                await deleteTask(task._id);
            }

            // Remove from state (handle both id types)
            await loadTasks();
        } catch (e) {
            alert("Failed to delete");
            setLoading(false);
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return '#ef4444';
            case 'medium': return '#fbbf24';
            case 'low': return '#22c55e';
            default: return '#fbbf24';
        }
    };

    return (
        <div style={{ padding: '40px', color: 'white', maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            {loading && <CyberLoader />}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ margin: 0 }}>Tasks</h1>
                {!googleConnected ? (
                    <button
                        onClick={handleConnectGoogle}
                        style={{
                            background: '#4285F4', color: 'white',
                            border: 'none', padding: '8px 16px', borderRadius: '8px',
                            fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                            fontSize: '14px'
                        }}
                    >
                        <LinkIcon size={16} /> Connect Google Tasks
                    </button>
                ) : (
                    <button
                        onClick={handleConnectGoogle}
                        title="Reconnect/Update Permissions"
                        style={{
                            background: 'transparent', color: '#4285F4',
                            border: '1px solid #4285F4', padding: '6px 12px', borderRadius: '8px',
                            fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                            fontSize: '12px'
                        }}
                    >
                        <RefreshCw size={14} /> Reconnect
                    </button>
                )}
            </div>

            {/* CREATE BAR */}
            <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', marginBottom: '40px', background: '#18181b', padding: '16px', borderRadius: '12px', border: '1px solid #333' }}>
                <input
                    type="text"
                    placeholder="Add a new task..."
                    value={newTask}
                    onChange={e => setNewTask(e.target.value)}
                    style={{ flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '16px', outline: 'none' }}
                />
                <input
                    type="date"
                    value={newTaskDeadline}
                    onChange={e => setNewTaskDeadline(e.target.value)}
                    style={{ background: '#27272a', border: 'none', borderRadius: '6px', color: 'white', padding: '8px' }}
                />
                <select
                    value={newTaskPriority}
                    onChange={e => setNewTaskPriority(e.target.value)}
                    style={{ background: '#27272a', border: 'none', borderRadius: '6px', color: 'white', padding: '8px' }}
                >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>

                {googleConnected && (
                    <div
                        onClick={() => setSyncGoogle(!syncGoogle)}
                        title="Save to Google Tasks too?"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: syncGoogle ? '#4285F4' : '#27272a',
                            padding: '10px', borderRadius: '6px', cursor: 'pointer', transition: '0.2s'
                        }}
                    >
                        <Cloud size={18} color="white" />
                    </div>
                )}
                <button type="submit" style={{ background: 'var(--accent-green)', borderRadius: '6px', border: 'none', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Plus color="black" />
                </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tasks.map(task => (
                    <div
                        key={task.id || task._id}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '16px',
                            padding: '16px', background: '#18181b', borderRadius: '12px',
                            borderLeft: `4px solid ${task.source === 'google' ? '#4285F4' : getPriorityColor(task.priority)}`,
                            opacity: task.status === 'done' ? 0.5 : 1,
                            transition: 'all 0.2s',
                            border: task.source === 'google' ? '1px solid rgba(66, 133, 244, 0.3)' : 'none'
                        }}
                    >
                        <div onClick={() => task.source !== 'google' && toggleStatus(task)} style={{ cursor: task.source === 'google' ? 'default' : 'pointer' }}>
                            {task.status === 'done' ? <CheckCircle color={task.source === 'google' ? '#4285F4' : "var(--accent-green)"} /> : <Circle color="#52525b" />}
                        </div>

                        <div style={{ flex: 1 }}>
                            <div style={{
                                textDecoration: task.status === 'done' ? 'line-through' : 'none',
                                fontSize: '16px', fontWeight: '500',
                                display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                {task.title}
                                {task.source === 'google' && <span style={{ fontSize: '10px', background: '#4285F4', padding: '2px 6px', borderRadius: '4px', color: 'white', fontWeight: 'bold' }}>Google</span>}
                            </div>
                            <div style={{ fontSize: '12px', color: '#a1a1aa', marginTop: '4px', display: 'flex', gap: '8px' }}>
                                {task.deadline && <span>📅 {new Date(task.deadline).toLocaleDateString()}</span>}
                                {task.course && <span>📚 {task.course}</span>}
                            </div>
                        </div>

                        <button
                            onClick={() => handleDelete(task)}
                            style={{ background: 'transparent', border: 'none', color: '#52525b', cursor: 'pointer', padding: '8px' }}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TasksPage;
