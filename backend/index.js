require('dotenv').config()
const express = require('express')
const cors = require('cors')
const pool = require('./db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authenticateToken = require('./middleware/auth')

const app = express()
const PORT = 5000

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('UserHub Backend API is running!')
})

app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'Frontend can communicate with UserHub backend!'
    })
})

app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must contain at least 8 characters.'
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const result = await pool.query(
            'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id, full_name, email',
            [fullName, email, hashedPassword]
        )

        res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            user: result.rows[0]
        })

    } catch (error) {
        console.error('Registration error:', error.message)

        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                message: 'Email address is already registered.'
            })
        }

        res.status(500).json({
            success: false,
            message: 'An error occurred during registration.'
        })
    }
})

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            })
        }

        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        )

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            })
        }

        const user = result.rows[0]

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        )

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            })
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
        )

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                id: user.id,
                full_name: user.full_name,
                email: user.email
            }
        })

    } catch (error) {
        console.error('Login error:', error.message)

        res.status(500).json({
            success: false,
            message: 'An error occurred during login.'
        })
    }
})

app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, full_name, email, created_at FROM users WHERE id = $1',
            [req.user.userId]
        )

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            })
        }

        res.status(200).json({
            success: true,
            user: result.rows[0]
        })

    } catch (error) {
        console.error('Profile error:', error.message)

        res.status(500).json({
            success: false,
            message: 'Unable to retrieve profile.'
        })
    }
})


pool.query('SELECT NOW()', (err, result) => {
    if (err) {
        console.error('Database connection failed:', err.message)
    } else {
        console.log('Database connected successfully:', result.rows[0])
    }
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})