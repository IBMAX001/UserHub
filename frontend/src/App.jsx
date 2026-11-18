import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profilePicture, setProfilePicture] = useState(null)
  const [preview, setPreview] = useState(null)
  const [backendStatus, setBackendStatus] = useState('Connecting...')

  useEffect(() => {
    fetch('http://localhost:5000/api/test')
      .then((response) => response.json())
      .then((data) => setBackendStatus(data.message))
      .catch(() => setBackendStatus('Backend connection failed'))
  }, [])

  function handleSubmit(event) {
    event.preventDefault()

    if (!fullName || !email || !password) {
      alert('Please fill in all required fields.')
      return
    }

    if (password.length < 8) {
      alert('Password must contain at least 8 characters.')
      return
    }

    if (profilePicture) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

      if (!allowedTypes.includes(profilePicture.type)) {
        alert('Only JPG, PNG, and WEBP images are allowed.')
        return
      }

      if (profilePicture.size > 2 * 1024 * 1024) {
        alert('Profile picture must not exceed 2 MB.')
        return
      }
    }

    fetch('http://localhost:5000/api/register', {
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
      .then((response) => response.json())
      .then((data) => {
        alert(data.message)
      })
      .catch((error) => {
        console.error('Registration error:', error)
        alert('Unable to connect to the backend.')
      })
  }

  return (
    <div className="app">
      <header>
        <h1>UserHub</h1>
        <nav>
          <a href="/">Home</a>
          <a href="/login">Login</a>
          <a href="/register">Register</a>
        </nav>
      </header>

      <main>
        <h2>Create Your Account</h2>
        <p>Join UserHub and manage your profile.</p>
        <p>{backendStatus}</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            required
          />

          <label>Profile Picture</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files[0]
              setProfilePicture(file || null)
              setPreview(file ? URL.createObjectURL(file) : null)
            }}
          />

          {preview && (
            <img
              src={preview}
              alt="Profile preview"
              className="profile-preview"
            />
          )}

          <button type="submit">Create Account</button>
        </form>
      </main>
    </div>
  )
}

export default App