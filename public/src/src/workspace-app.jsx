import React, { useState } from 'react';

const BioSecureApp = () => {
  const seaGreen = '#16A085';
  const seaGreenLight = '#E8F7F4';
  const white = '#FFFFFF';
  const darkText = '#1A1A1A';
  const lightText = '#666666';
  const borderColor = '#E0E0E0';

  const [activeTab, setActiveTab] = useState('email');
  const [companyDocs, setCompanyDocs] = useState([
    { id: 1, name: 'BioSecure Brand Guidelines', content: 'BioSecure Blockchain Solutions LTD represents cutting-edge biotechnology security. Maintain professional, trustworthy tone. Emphasize data security, blockchain integrity, and client confidentiality. Always mention compliance certifications.' }
  ]);
  const [emailState, setEmailState] = useState({ clientMessage: '', companyDocId: 1, generatedEmail: '' });
  const [meetingNotes, setMeetingNotes] = useState([]);
  const [newMeetingNote, setNewMeetingNote] = useState('');
  const [projectBoard, setProjectBoard] = useState([]);
  const [sops, setSops] = useState([
    { id: 1, title: 'Client Data Security Protocol', content: 'Step 1: Data Classification & Assessment\nStep 2: Blockchain Integration Setup\nStep 3: Security Audit & Compliance Check\nStep 4: Client Notification & Onboarding', comments: [{ author: 'Sarah', text: 'Need to add GDPR compliance step' }] }
  ]);
  const [selectedSop, setSelectedSop] = useState(1);
  const [sopComment, setSopComment] = useState('');

  // Email Response Generator
  const generateEmailResponse = async () => {
    if (!emailState.clientMessage.trim()) return;
    const doc = companyDocs.find(d => d.id === emailState.companyDocId);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a professional business communications assistant for BioSecure Blockchain Solutions LTD. Generate a concise, professional email response based on the client's message and company guidelines:\n\nCompany Guidelines: ${doc?.content || 'Be professional and helpful.'}\n\nGenerate ONLY the email body (no subject line or greeting). Keep it under 150 words. Be warm but professional.`,
          messages: [{ role: "user", content: `Client message: ${emailState.clientMessage}` }]
        })
      });
      const data = await response.json();
      const generatedText = data.content[0]?.text || 'Failed to generate response';
      setEmailState(prev => ({ ...prev, generatedEmail: generatedText }));
    } catch (err) {
      setEmailState(prev => ({ ...prev, generatedEmail: `Error: ${err.message}` }));
    }
  };

  // Meeting Note Summarizer
  const summarizeMeetingNote = async (note) => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: `You are a project management assistant. Summarize meeting notes into concise action items and project tasks. Return JSON with format: { "summary": "brief summary", "tasks": ["task1", "task2"] }. Only return JSON, no other text.`,
          messages: [{ role: "user", content: `Meeting notes:\n${note}` }]
        })
      });
      const data = await response.json();
      let parsed = { summary: '', tasks: [] };
      try {
        parsed = JSON.parse(data.content[0]?.text || '{}');
      } catch {
        parsed = { summary: data.content[0]?.text || 'Unable to parse', tasks: [] };
      }
      return parsed;
    } catch (err) {
      return { summary: `Error: ${err.message}`, tasks: [] };
    }
  };

  const addMeetingNote = async () => {
    if (!newMeetingNote.trim()) return;
    const result = await summarizeMeetingNote(newMeetingNote);
    const newTask = {
      id: Date.now(),
      summary: result.summary,
      tasks: result.tasks,
      status: 'To Do',
      date: new Date().toLocaleDateString()
    };
    setMeetingNotes(prev => [newTask, ...prev]);
    setProjectBoard(prev => [...prev, ...result.tasks.map(t => ({ id: Date.now() + Math.random(), task: t, status: 'To Do' }))]);
    setNewMeetingNote('');
  };

  const updateProjectTask = (id, newStatus) => {
    setProjectBoard(prev => prev.map(task => task.id === id ? { ...task, status: newStatus } : task));
  };

  // SOP Comments
  const addSopComment = () => {
    if (!sopComment.trim()) return;
    setSops(prev => prev.map(sop => {
      if (sop.id === selectedSop) {
        return {
          ...sop,
          comments: [...(sop.comments || []), { author: 'You', text: sopComment }]
        };
      }
      return sop;
    }));
    setSopComment('');
  };

  const currentSop = sops.find(s => s.id === selectedSop);

  return (
    <div style={{ background: white, minHeight: '100vh', padding: '1.5rem 0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header with Brand */}
        <div style={{ marginBottom: '2rem', borderBottom: `3px solid ${seaGreen}`, paddingBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '8px', 
              background: seaGreen, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 'bold',
              color: white,
              fontSize: '22px'
            }}>
              B
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: '0', color: seaGreen }}>BioSecure Blockchain Solutions LTD</h1>
              <p style={{ fontSize: '12px', margin: '2px 0 0 0', color: lightText }}>Team Workspace Hub</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: `1px solid ${borderColor}`, paddingBottom: '1rem' }}>
          {[
            { id: 'email', label: 'Email Generator', icon: '✉️' },
            { id: 'meetings', label: 'Meeting Notes', icon: '📝' },
            { id: 'sop', label: 'SOP Viewer', icon: '📋' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.25rem',
                fontSize: '14px',
                fontWeight: '600',
                background: activeTab === tab.id ? seaGreenLight : 'transparent',
                border: activeTab === tab.id ? `2px solid ${seaGreen}` : `2px solid ${borderColor}`,
                borderRadius: '6px',
                cursor: 'pointer',
                color: activeTab === tab.id ? seaGreen : lightText,
                transition: 'all 0.2s'
              }}
            >
              <span style={{ marginRight: '0.5rem' }}>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>

        {/* Email Response Generator */}
        {activeTab === 'email' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ background: white, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1.5rem 0', color: seaGreen }}>Email Response Generator</h2>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '0.5rem', color: darkText }}>Reference Document</label>
                  <select
                    value={emailState.companyDocId}
                    onChange={(e) => setEmailState(prev => ({ ...prev, companyDocId: parseInt(e.target.value) }))}
                    style={{ width: '100%', padding: '0.75rem', fontSize: '14px', borderRadius: '6px', border: `1px solid ${borderColor}`, fontFamily: 'inherit', color: darkText, background: white }}
                  >
                    {companyDocs.map(doc => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '0.5rem', color: darkText }}>Client Message</label>
                  <textarea
                    value={emailState.clientMessage}
                    onChange={(e) => setEmailState(prev => ({ ...prev, clientMessage: e.target.value }))}
                    placeholder="Paste the client's message or question here..."
                    style={{ width: '100%', minHeight: '120px', padding: '0.75rem', fontSize: '14px', borderRadius: '6px', border: `1px solid ${borderColor}`, fontFamily: 'monospace', resize: 'vertical', color: darkText, background: white }}
                  />
                </div>

                <button
                  onClick={generateEmailResponse}
                  disabled={!emailState.clientMessage.trim()}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: emailState.clientMessage.trim() ? seaGreen : '#CCC',
                    color: white,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: emailState.clientMessage.trim() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s'
                  }}
                >
                  Generate Response
                </button>
              </div>
            </div>

            <div>
              <div style={{ background: white, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1rem 0', color: seaGreen }}>Generated Email</h2>
                {emailState.generatedEmail ? (
                  <div>
                    <div style={{
                      background: seaGreenLight,
                      padding: '1rem',
                      borderRadius: '6px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      marginBottom: '1rem',
                      minHeight: '200px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      color: darkText
                    }}>
                      {emailState.generatedEmail}
                    </div>
                    <button
                      onClick={async (event) => {
                        try {
                          await navigator.clipboard.writeText(emailState.generatedEmail);
                          const btn = event.target;
                          const originalText = btn.textContent;
                          btn.textContent = '✓ Copied!';
                          btn.style.background = seaGreen;
                          btn.style.color = white;
                          setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.background = 'transparent';
                            btn.style.color = seaGreen;
                          }, 2000);
                        } catch (err) {
                          const textarea = document.createElement('textarea');
                          textarea.value = emailState.generatedEmail;
                          document.body.appendChild(textarea);
                          textarea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textarea);
                          
                          const btn = event.target;
                          const originalText = btn.textContent;
                          btn.textContent = '✓ Copied!';
                          btn.style.background = seaGreen;
                          btn.style.color = white;
                          setTimeout(() => {
                            btn.textContent = originalText;
                            btn.style.background = 'transparent';
                            btn.style.color = seaGreen;
                          }, 2000);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'transparent',
                        color: seaGreen,
                        border: `1.5px solid ${seaGreen}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Copy to Clipboard
                    </button>
                  </div>
                ) : (
                  <p style={{ color: lightText, fontSize: '13px', margin: '0' }}>Your generated email will appear here</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Meeting Notes & Project Board */}
        {activeTab === 'meetings' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <div style={{ background: white, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1.5rem 0', color: seaGreen }}>Add Meeting Notes</h2>
                <textarea
                  value={newMeetingNote}
                  onChange={(e) => setNewMeetingNote(e.target.value)}
                  placeholder="Paste or type meeting notes. AI will summarize and create tasks..."
                  style={{ width: '100%', minHeight: '200px', padding: '0.75rem', fontSize: '14px', borderRadius: '6px', border: `1px solid ${borderColor}`, fontFamily: 'monospace', resize: 'vertical', marginBottom: '1rem', color: darkText, background: white }}
                />
                <button
                  onClick={addMeetingNote}
                  disabled={!newMeetingNote.trim()}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: newMeetingNote.trim() ? seaGreen : '#CCC',
                    color: white,
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: newMeetingNote.trim() ? 'pointer' : 'not-allowed'
                  }}
                >
                  Summarize & Add to Board
                </button>

                {meetingNotes.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '1rem', color: lightText }}>Recent Summaries</h3>
                    {meetingNotes.slice(0, 3).map(note => (
                      <div key={note.id} style={{ marginBottom: '1rem', padding: '0.75rem', background: seaGreenLight, borderRadius: '6px', fontSize: '13px', borderLeft: `3px solid ${seaGreen}` }}>
                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: seaGreen }}>{note.date}</p>
                        <p style={{ margin: '0', color: darkText, lineHeight: '1.5' }}>{note.summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <div style={{ background: white, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1.5rem 0', color: seaGreen }}>Project Board</h2>
                {projectBoard.length === 0 ? (
                  <p style={{ color: lightText, fontSize: '13px', margin: '0' }}>Tasks from meeting notes will appear here</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {projectBoard.map(task => (
                      <div key={task.id} style={{ padding: '0.75rem', background: seaGreenLight, borderRadius: '6px', borderLeft: `3px solid ${seaGreen}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '0.75rem' }}>
                          <p style={{ margin: '0', fontSize: '13px', color: darkText, flex: 1 }}>{task.task}</p>
                          <select
                            value={task.status}
                            onChange={(e) => updateProjectTask(task.id, e.target.value)}
                            style={{
                              fontSize: '12px',
                              padding: '0.35rem 0.5rem',
                              borderRadius: '4px',
                              border: `1px solid ${borderColor}`,
                              background: white,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                              color: task.status === 'Done' ? seaGreen : lightText
                            }}
                          >
                            <option value="To Do">To Do</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SOP Viewer */}
        {activeTab === 'sop' && (
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
            <div>
              <div style={{ background: white, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <h2 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 1rem 0', color: seaGreen }}>SOPs</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {sops.map(sop => (
                    <button
                      key={sop.id}
                      onClick={() => setSelectedSop(sop.id)}
                      style={{
                        textAlign: 'left',
                        padding: '0.75rem',
                        background: selectedSop === sop.id ? seaGreenLight : 'transparent',
                        color: selectedSop === sop.id ? seaGreen : darkText,
                        border: selectedSop === sop.id ? `2px solid ${seaGreen}` : `1px solid ${borderColor}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: selectedSop === sop.id ? '600' : '500'
                      }}
                    >
                      {sop.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              {currentSop && (
                <div style={{ background: white, border: `1px solid ${borderColor}`, borderRadius: '12px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                  <h2 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 1rem 0', color: seaGreen }}>{currentSop.title}</h2>
                  <div style={{
                    background: seaGreenLight,
                    padding: '1rem',
                    borderRadius: '6px',
                    marginBottom: '1.5rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: darkText
                  }}>
                    {currentSop.content}
                  </div>

                  <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '1.5rem' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', margin: '0 0 1rem 0', color: seaGreen }}>Comments ({currentSop.comments?.length || 0})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                      {currentSop.comments?.map((comment, idx) => (
                        <div key={idx} style={{ padding: '0.75rem', background: seaGreenLight, borderRadius: '6px', borderLeft: `3px solid ${seaGreen}` }}>
                          <p style={{ margin: '0 0 0.25rem 0', fontSize: '12px', fontWeight: '600', color: seaGreen }}>{comment.author}</p>
                          <p style={{ margin: '0', fontSize: '13px', color: darkText }}>{comment.text}</p>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        value={sopComment}
                        onChange={(e) => setSopComment(e.target.value)}
                        onKeyPress={(e) => { if (e.key === 'Enter') addSopComment(); }}
                        placeholder="Add a comment..."
                        style={{ flex: 1, padding: '0.75rem', fontSize: '13px', borderRadius: '6px', border: `1px solid ${borderColor}`, color: darkText, background: white }}
                      />
                      <button
                        onClick={addSopComment}
                        disabled={!sopComment.trim()}
                        style={{
                          padding: '0.75rem 1rem',
                          background: sopComment.trim() ? seaGreen : '#CCC',
                          color: white,
                          border: 'none',
                          borderRadius: '6px',
                          cursor: sopComment.trim() ? 'pointer' : 'not-allowed',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BioSecureApp;
