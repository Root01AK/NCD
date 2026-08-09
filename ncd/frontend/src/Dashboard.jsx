import { useState, useEffect } from 'react'

export default function Dashboard({ token, user, onLogout }) {
  const [screenings, setScreenings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchScreenings = async () => {
      try {
        const response = await fetch('http://localhost:8080/index.php/api/v1/dashboard/screeninglist', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        
        if (response.ok && data.status === 'success') {
          setScreenings(data.data)
        } else {
          setError(data.message || 'Failed to fetch screenings')
          if (response.status === 401) onLogout() // Token expired
        }
      } catch (err) {
        setError('Error connecting to API')
      } finally {
        setLoading(false)
      }
    }

    fetchScreenings()
  }, [token, onLogout])

  return (
    <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '40px', height: '40px', background: 'var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#fff' }}>NCD</span>
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', margin: 0 }}>Admin Dashboard</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>Welcome back, {user?.username}</p>
          </div>
        </div>
        <button 
          onClick={onLogout}
          style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: 'var(--error)', 
            border: '1px solid rgba(239, 68, 68, 0.2)',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Sign Out
        </button>
      </header>

      {/* Main Content */}
      <main style={{ display: 'grid', gap: '2rem', gridTemplateColumns: '1fr' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '24px', background: 'var(--accent)', borderRadius: '4px', display: 'inline-block' }}></span>
            Recent Screenings
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
              Loading data from Yii2 API...
            </div>
          ) : error ? (
            <div className="error-msg">{error}</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>ID</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Participant ID</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Date</th>
                    <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {screenings.slice(0, 10).map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem' }}>{row.mem_scrn_id}</td>
                      <td style={{ padding: '1rem', fontWeight: '500', color: 'var(--accent)' }}>{row.mem_scrn_part_id}</td>
                      <td style={{ padding: '1rem' }}>{row.mem_scrn_date}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          background: row.mem_scrn_q24 == 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: row.mem_scrn_q24 == 1 ? '#10b981' : '#ef4444',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          {row.mem_scrn_q24 == 1 ? 'Eligible' : 'Not Eligible'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {screenings.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No screenings found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
