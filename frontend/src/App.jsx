
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [user, setUser] = useState(null)
  const [backendStatus, setBackendStatus] = useState('Checking connection...')
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profilePicture, setProfilePicture] = useState(null)
  const [preview, setPreview] = useState(null)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then((response) => response.json())
      .then((data) => setBackendStatus(data.message))
      .catch(() => setBackendStatus('Backend connection failed'))
  }, [])

  function showMessage(text, type = 'success') {
    setMessage(text)
    setMessageType(type)
  }

  async function handleRegister(event) {
    event.preventDefault()
    setMessage('')

    if (password.length < 8) {
      showMessage('Password must contain at least 8 characters.', 'error')
      return
    }

    if (profilePicture) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

      if (!allowedTypes.includes(profilePicture.type)) {
        showMessage('Only JPG, PNG and WEBP images are allowed.', 'error')
        return
      }

      if (profilePicture.size > 2 * 1024 * 1024) {
        showMessage('Profile picture must not exceed 2 MB.', 'error')
        return
      }
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        showMessage(data.message, 'error')
        return
      }

      showMessage('Account created successfully. You can now log in.')
      setFullName('')
      setEmail('')
      setPassword('')
      setProfilePicture(null)
      setPreview(null)
      setCurrentPage('login')
      setLoginEmail(email)

    } catch (error) {
      console.error('Registration error:', error)
      showMessage('Unable to connect to the backend.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setMessage('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        showMessage(data.message, 'error')
        return
      }

      sessionStorage.setItem('token', data.token)

      const profileResponse = await fetchProfile(data.token)

      if (profileResponse) {
        showMessage('Login successful.')
      }

    } catch (error) {
      console.error('Login error:', error)
      showMessage('Unable to connect to the backend.', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function fetchProfile(token = sessionStorage.getItem('token')) {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        sessionStorage.removeItem('token')
        showMessage(data.message, 'error')
        return false
      }

      setUser(data.user)
      setCurrentPage('dashboard')
      return true

    } catch (error) {
      console.error('Profile error:', error)
      showMessage('Unable to retrieve your profile.', 'error')
      return false
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('token')
    setUser(null)
    setLoginPassword('')
    setCurrentPage('login')
    setSidebarOpen(false)
    showMessage('You have logged out successfully.')
  }

  function handlePictureChange(event) {
    const file = event.target.files[0]

    setProfilePicture(file || null)
    setPreview(file ? URL.createObjectURL(file) : null)
  }

  function navigate(page) {
    setCurrentPage(page)
    setMessage('')
    setSidebarOpen(false)
  }

  const initials = user?.full_name
    ? user.full_name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : 'U'

  return (
    <div className="app-container">

      {currentPage === 'login' || currentPage === 'register' ? (
        <div className="auth-layout">

          <section className="auth-brand-panel">
            <div className="brand-logo">
              <span className="brand-icon">U</span>
              <span>UserHub</span>
            </div>

            <div className="brand-content">
              <span className="eyebrow">YOUR PERSONAL SPACE</span>
              <h1>Everything about you, in one place.</h1>
              <p>
                A simpler way to manage your account, access your information
                and stay connected.
              </p>

              <div className="brand-features">
                <div>✓ Secure account management</div>
                <div>✓ Personalised user dashboard</div>
                <div>✓ Simple and seamless experience</div>
              </div>
            </div>

            <p className="brand-footer">
              © 2026 UserHub. All rights reserved.
            </p>
          </section>

          <section className="auth-form-panel">

            <div className="mobile-brand">
              <span className="brand-icon">U</span>
              <span>UserHub</span>
            </div>

            <div className="auth-form-wrapper">

              <div className="auth-heading">
                <span className="eyebrow">
                  {currentPage === 'login' ? 'WELCOME BACK' : 'GET STARTED'}
                </span>

                <h2>
                  {currentPage === 'login'
                    ? 'Sign in to your account'
                    : 'Create your account'}
                </h2>

                <p>
                  {currentPage === 'login'
                    ? 'Enter your details to access your dashboard.'
                    : 'Join UserHub and get your personal space.'}
                </p>
              </div>

              {message && (
                <div className={`message ${messageType}`}>
                  {message}
                </div>
              )}

              {currentPage === 'login' ? (
                <form onSubmit={handleLogin}>

                  <div className="form-group">
                    <label htmlFor="loginEmail">Email address</label>
                    <input
                      id="loginEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={loginEmail}
                      onChange={(event) => setLoginEmail(event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="loginPassword">Password</label>
                    <input
                      id="loginPassword"
                      type="password"
                      placeholder="Enter your password"
                      value={loginPassword}
                      onChange={(event) => setLoginPassword(event.target.value)}
                      required
                    />
                  </div>

                  <button className="primary-button" type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                    {!loading && <span>→</span>}
                  </button>

                </form>
              ) : (
                <form onSubmit={handleRegister}>

                  <div className="form-group">
                    <label htmlFor="fullName">Full name</label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="registerEmail">Email address</label>
                    <input
                      id="registerEmail"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="registerPassword">Password</label>
                    <input
                      id="registerPassword"
                      type="password"
                      placeholder="Minimum 8 characters"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      minLength={8}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="profilePicture">Profile picture (optional)</label>
                    <input
                      id="profilePicture"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePictureChange}
                    />
                    {preview && (
                      <img
                        src={preview}
                        alt="Profile preview"
                        className="profile-preview"
                      />
                    )}
                  </div>

                  <button className="primary-button" type="submit" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create account'}
                    {!loading && <span>→</span>}
                  </button>

                </form>
              )}

              <div className="auth-switch">
                {currentPage === 'login'
                  ? "Don't have an account?"
                  : 'Already have an account?'}

                <button
                  type="button"
                  onClick={() => navigate(
                    currentPage === 'login' ? 'register' : 'login'
                  )}
                >
                  {currentPage === 'login' ? 'Create account' : 'Sign in'}
                </button>
              </div>

              <div className="connection-status">
                <span className={backendStatus === 'Backend connection failed' ? 'status-dot offline' : 'status-dot'}></span>
                {backendStatus}
              </div>

            </div>
          </section>
        </div>

      ) : (
        <div className="dashboard-layout">

          <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
            <div className="sidebar-brand">
              <span className="brand-icon">U</span>
              <span>UserHub</span>
            </div>

            <div className="sidebar-section-label">MENU</div>

            <button
              className="sidebar-link active"
              onClick={() => navigate('dashboard')}
            >
              <span>▦</span> Overview
            </button>

            <div className="sidebar-section-label">ACCOUNT</div>

            <button
              className="sidebar-link"
              onClick={() => navigate('profile')}
            >
              <span>♙</span> My Profile
            </button>

            <div className="sidebar-bottom">
              <div className="sidebar-user">
                <div className="avatar-small">{initials}</div>
                <div>
                  <strong>{user?.full_name}</strong>
                  <span>Account holder</span>
                </div>
              </div>

              <button className="sidebar-logout" onClick={handleLogout}>
                ↪ Sign out
              </button>
            </div>
          </aside>

          {sidebarOpen && (
            <div
              className="sidebar-overlay"
              onClick={() => setSidebarOpen(false)}
            ></div>
          )}

          <section className="dashboard-main">

            <header className="dashboard-header">
              <button
                className="mobile-menu-button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle navigation"
              >
                ☰
              </button>

              <div>
                <h2>
                  {currentPage === 'dashboard' ? 'Overview' : 'My Profile'}
                </h2>
                <p>Welcome to your personal workspace.</p>
              </div>

              <div className="header-user">
                <div className="avatar-small">{initials}</div>
                <span>{user?.full_name}</span>
              </div>
            </header>

            <main className="dashboard-content">

              {message && (
                <div className={`message ${messageType}`}>
                  {message}
                </div>
              )}

              {currentPage === 'dashboard' ? (
                <>
                  <div className="welcome-banner">
                    <div>
                      <span>YOUR USERHUB WORKSPACE</span>
                      <h1>Hello, {user?.full_name?.split(' ')[0]}!</h1>
                      <p>
                        Your account is active. Here's an overview of your
                        account information.
                      </p>
                    </div>

                    <div className="welcome-illustration">U</div>
                  </div>

                  <div className="dashboard-section-heading">
                    <h3>Account overview</h3>
                    <span>Personal information</span>
                  </div>

                  <div className="stats-grid">

                    <div className="stat-card">
                      <div className="stat-icon blue">♙</div>
                      <span>Account status</span>
                      <h3>Active</h3>
                      <p>Your account is operational</p>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon purple">✉</div>
                      <span>Email address</span>
                      <h3 className="stat-email">{user?.email}</h3>
                      <p>Registered email address</p>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon green">#</div>
                      <span>User ID</span>
                      <h3>#{user?.id}</h3>
                      <p>Your unique account identifier</p>
                    </div>

                  </div>

                  <div className="dashboard-section-heading">
                    <h3>Account details</h3>
                    <button onClick={() => navigate('profile')}>
                      View profile →
                    </button>
                  </div>

                  <div className="profile-card">
                    <div className="profile-card-avatar">{initials}</div>

                    <div className="profile-card-info">
                      <h3>{user?.full_name}</h3>
                      <p>{user?.email}</p>
                      <span className="account-badge">Active account</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="dashboard-section-heading">
                    <h3>Personal profile</h3>
                    <span>Your registered account information</span>
                  </div>

                  <div className="profile-details-card">
                    <div className="profile-details-header">
                      <div className="profile-large-avatar">{initials}</div>
                      <div>
                        <h2>{user?.full_name}</h2>
                        <p>{user?.email}</p>
                      </div>
                    </div>

                    <div className="profile-detail-row">
                      <span>Full name</span>
                      <strong>{user?.full_name}</strong>
                    </div>

                    <div className="profile-detail-row">
                      <span>Email address</span>
                      <strong>{user?.email}</strong>
                    </div>

                    <div className="profile-detail-row">
                      <span>Account ID</span>
                      <strong>#{user?.id}</strong>
                    </div>

                    <div className="profile-detail-row">
                      <span>Account created</span>
                      <strong>
                        {user?.created_at
                          ? new Date(user.created_at).toLocaleDateString()
                          : 'Not available'}
                      </strong>
                    </div>
                  </div>
                </>
              )}

              <footer className="dashboard-footer">
                © 2026 UserHub. All rights reserved.
                <span>{backendStatus}</span>
              </footer>

            </main>
          </section>
        </div>
      )}
    </div>
  )
}

export default App
