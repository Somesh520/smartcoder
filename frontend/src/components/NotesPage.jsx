import React, { useState, useEffect } from 'react';
import { fetchNotes, createNote, updateNote, deleteNote } from '../api';
import { Plus, Trash2, Save, FileText, Pin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-dark.css';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [selectedNote, setSelectedNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [tags, setTags] = useState("");
    const [course, setCourse] = useState("");

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        setLoading(true);
        try {
            const data = await fetchNotes();
            if (Array.isArray(data)) {
                setNotes(data);
            } else {
                console.error("Fetched notes is not an array:", data);
                setNotes([]);
            }
        } catch (e) {
            console.error(e);
            setNotes([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectNote = (note) => {
        setSelectedNote(note);
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags.join(', '));
        setCourse(note.course || "");
        setIsEditing(false); // View mode initially
    };

    const handleNewNote = () => {
        setSelectedNote(null);
        setTitle("");
        setContent("");
        setTags("");
        setCourse("");
        setIsEditing(true);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert("Please enter a title for your note.");
            return;
        }

        const noteData = {
            title,
            content,
            tags: tags.split(',').map(t => t.trim()).filter(t => t),
            course
        };

        try {
            if (selectedNote && selectedNote._id) {
                await updateNote(selectedNote._id, noteData);
            } else {
                await createNote(noteData);
            }
            setIsEditing(false);
            loadNotes();
            handleNewNote(); // Reset to new state or stay selected? Let's reset for now or keep selected
        } catch (e) {
            alert("Failed to save note");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this note?")) return;
        await deleteNote(id);
        loadNotes();
        if (selectedNote && selectedNote._id === id) {
            handleNewNote();
        }
    };

    return (
        <div style={{ display: 'flex', height: '100%', color: 'white' }}>
            {/* LEFT SIDEBAR: LIST */}
            <div style={{ width: '300px', borderRight: '1px solid #333', padding: '20px', overflowY: 'auto' }}>
                <button
                    onClick={handleNewNote}
                    style={{
                        width: '100%', padding: '12px', background: 'var(--accent-green)', color: 'black',
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', marginBottom: '20px'
                    }}
                >
                    <Plus size={18} /> New Note
                </button>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {loading ? <p>Loading...</p> : notes.map(note => (
                        <div
                            key={note._id}
                            onClick={() => handleSelectNote(note)}
                            style={{
                                padding: '12px', borderRadius: '8px',
                                background: selectedNote?._id === note._id ? '#27272a' : 'transparent',
                                cursor: 'pointer', border: '1px solid', borderColor: selectedNote?._id === note._id ? 'var(--accent-green)' : 'transparent'
                            }}
                        >
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{note.title}</div>
                            <div style={{ fontSize: '12px', color: '#a1a1aa' }}>
                                {note.course && <span style={{ background: '#3f3f46', padding: '2px 6px', borderRadius: '4px', marginRight: '6px' }}>{note.course}</span>}
                                {new Date(note.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {notes.length === 0 && !loading && <p style={{ color: '#52525b', textAlign: 'center' }}>No notes yet.</p>}
                </div>
            </div>

            {/* RIGHT SIDE: EDITOR / VIEWER */}
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {(isEditing || selectedNote) ? (
                    <>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Note Title"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                style={{
                                    flex: 1, background: 'transparent', border: 'none',
                                    fontSize: '32px', fontWeight: 'bold', color: 'white', outline: 'none'
                                }}
                            />
                            {isEditing ? (
                                <button
                                    onClick={handleSave}
                                    style={{ background: 'var(--accent-green)', color: 'black', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <Save size={18} /> Save
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        style={{ background: '#3f3f46', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedNote._id)}
                                        style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                            <input
                                type="text"
                                placeholder="Course (e.g. CS101)"
                                value={course}
                                onChange={e => setCourse(e.target.value)}
                                style={{ background: '#18181b', border: '1px solid #3f3f46', padding: '8px', borderRadius: '6px', color: 'white', width: '200px' }}
                            />
                            <input
                                type="text"
                                placeholder="Tags (comma separated)"
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                style={{ background: '#18181b', border: '1px solid #3f3f46', padding: '8px', borderRadius: '6px', color: 'white', flex: 1 }}
                            />
                        </div>

                        {isEditing ? (
                            <div style={{ flex: 1, border: '1px solid #333', borderRadius: '8px', overflow: 'hidden', minHeight: '400px', background: '#09090b' }}>
                                <Editor
                                    value={content}
                                    onValueChange={setContent}
                                    highlight={code => highlight(code, languages.markdown || languages.js || languages.clike)}
                                    padding={20}
                                    style={{
                                        fontFamily: '"Fira code", "Fira Mono", monospace',
                                        fontSize: 16,
                                        minHeight: '100%',
                                        color: '#e4e4e7'
                                    }}
                                />
                            </div>
                        ) : (
                            <div style={{ lineHeight: '1.6', color: '#e4e4e7' }} className="markdown-preview">
                                <ReactMarkdown>{content}</ReactMarkdown>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#52525b' }}>
                        <FileText size={64} style={{ marginBottom: '20px', opacity: 0.5 }} />
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Select a note or create a new one</h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotesPage;
