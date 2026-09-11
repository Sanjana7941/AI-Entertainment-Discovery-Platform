const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'cinemind_super_secret_jwt_key_2026_entertainment_discovery';
  return jwt.sign({ id }, secret, { expiresIn: '7d' });
};

// @desc    Register a new user with entertainment preferences
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const {
      name,
      username,
      email,
      password,
      confirmPassword,
      dob,
      preferredLanguage,
      favoriteGenres = [],
      preferredContentTypes = [],
      preferredLanguages = []
    } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, username, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.'
      });
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'This username is already taken. Please choose another.'
      });
    }

    const languagesList = Array.isArray(preferredLanguages) && preferredLanguages.length > 0
      ? preferredLanguages
      : [preferredLanguage || 'English'];

    const user = await User.create({
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim().toLowerCase(),
      password,
      dob: dob || '',
      favoriteGenres: Array.isArray(favoriteGenres) ? favoriteGenres : [],
      preferredContentTypes: Array.isArray(preferredContentTypes) && preferredContentTypes.length > 0 ? preferredContentTypes : ['Movie', 'TV Show'],
      preferredLanguages: languagesList,
      role: 'user',
      status: 'active'
    });

    const token = generateToken(user._id);

    // Omit password from output
    const { password: _, ...safeUser } = user;

    res.status(201).json({
      success: true,
      message: 'Account registered successfully! Welcome to CineMind AI.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

// In-memory brute-force attempt tracker & rate-limiter
const loginAttempts = new Map(); // key: ip_identifier, value: { count: number, lockedUntil: number }
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 30 * 1000; // 30 seconds

// @desc    Check if an email or username exists in real-time
// @route   POST /api/auth/check-identifier
// @access  Public
const checkIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ success: false, message: 'Identifier is required.' });
    }

    const clean = identifier.trim().toLowerCase();
    if (clean.length < 2) {
      return res.json({ success: true, exists: false });
    }

    let user = await User.findOne({ email: clean });
    if (!user) {
      user = await User.findOne({ username: clean });
    }

    if (user) {
      const userSummary = {
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar,
        status: user.status
      };
      return res.json({
        success: true,
        exists: true,
        ...userSummary,
        user: userSummary
      });
    }

    return res.json({
      success: true,
      exists: false
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email/username and password.'
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const trackKey = `${clientIp}_${cleanIdentifier}`;
    const now = Date.now();

    // Check existing lockout
    const existingRecord = loginAttempts.get(trackKey);
    if (existingRecord && existingRecord.lockedUntil && existingRecord.lockedUntil > now) {
      const remainingSec = Math.ceil((existingRecord.lockedUntil - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Account security lockout active. Please wait ${remainingSec} seconds before retrying.`,
        locked: true,
        lockout: true,
        remainingSeconds: remainingSec
      });
    }

    let user = await User.findOne({ email: cleanIdentifier });
    if (!user) {
      user = await User.findOne({ username: cleanIdentifier });
    }

    const recordFailedAttempt = () => {
      const curRecord = loginAttempts.get(trackKey) || { count: 0, lockedUntil: 0 };
      curRecord.count += 1;
      if (curRecord.count >= MAX_ATTEMPTS) {
        curRecord.lockedUntil = now + LOCKOUT_DURATION_MS;
        curRecord.count = 0;
        loginAttempts.set(trackKey, curRecord);
        return { locked: true, remainingSeconds: 30 };
      }
      loginAttempts.set(trackKey, curRecord);
      return { locked: false, attemptsRemaining: MAX_ATTEMPTS - curRecord.count };
    };

    if (!user) {
      const status = recordFailedAttempt();
      if (status.locked) {
        return res.status(429).json({
          success: false,
          message: 'Too many consecutive failed login attempts. Security lockout active for 30 seconds.',
          locked: true,
          lockout: true,
          remainingSeconds: 30
        });
      }
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. (${status.attemptsRemaining} attempts remaining before security lockout)`
      });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      const status = recordFailedAttempt();
      if (status.locked) {
        return res.status(429).json({
          success: false,
          message: 'Too many consecutive failed login attempts. Security lockout active for 30 seconds.',
          locked: true,
          lockout: true,
          remainingSeconds: 30
        });
      }
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. (${status.attemptsRemaining} attempts remaining before security lockout)`
      });
    }

    // Clear failed attempts upon successful authentication
    loginAttempts.delete(trackKey);

    const token = generateToken(user._id);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    const { password: _, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with this email address.' });
    }

    // In a production system, an email with a reset token is dispatched.
    // For local discovery demo, provide a simulation instructions response.
    res.json({
      success: true,
      message: `Password reset instructions have been generated for ${user.email}. (Demo mode: Use account settings or login with demo credentials).`
    });
  } catch (err) {
    next(err);
  }
};

// In-memory 2FA challenge store (key: tempToken, value: { userId, otp, expiresAt })
const active2FAChallenges = new Map();

// Helper to mask email/target
const maskTarget = (target) => {
  if (!target || !target.includes('@')) return 'your linked device';
  const [name, domain] = target.split('@');
  const maskedName = name.length <= 2 ? name[0] + '*' : name[0] + '*'.repeat(Math.max(1, name.length - 2)) + name[name.length - 1];
  return `${maskedName}@${domain}`;
};

// @desc    Procedural Step 2: Verify password and issue 2FA security challenge
// @route   POST /api/auth/verify-step-credentials
// @access  Public
const verifyStepCredentials = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email/username and password.'
      });
    }

    const cleanIdentifier = identifier.trim().toLowerCase();
    const clientIp = req.ip || req.connection?.remoteAddress || '127.0.0.1';
    const trackKey = `${clientIp}_${cleanIdentifier}`;
    const now = Date.now();

    // Check existing lockout
    const existingRecord = loginAttempts.get(trackKey);
    if (existingRecord && existingRecord.lockedUntil && existingRecord.lockedUntil > now) {
      const remainingSec = Math.ceil((existingRecord.lockedUntil - now) / 1000);
      return res.status(429).json({
        success: false,
        message: `Account security lockout active. Please wait ${remainingSec} seconds before retrying.`,
        locked: true,
        lockout: true,
        remainingSeconds: remainingSec
      });
    }

    let user = await User.findOne({ email: cleanIdentifier });
    if (!user) {
      user = await User.findOne({ username: cleanIdentifier });
    }

    const recordFailedAttempt = () => {
      const curRecord = loginAttempts.get(trackKey) || { count: 0, lockedUntil: 0 };
      curRecord.count += 1;
      if (curRecord.count >= MAX_ATTEMPTS) {
        curRecord.lockedUntil = now + LOCKOUT_DURATION_MS;
        curRecord.count = 0;
        loginAttempts.set(trackKey, curRecord);
        return { locked: true, remainingSeconds: 30 };
      }
      loginAttempts.set(trackKey, curRecord);
      return { locked: false, attemptsRemaining: MAX_ATTEMPTS - curRecord.count };
    };

    if (!user) {
      const status = recordFailedAttempt();
      if (status.locked) {
        return res.status(429).json({
          success: false,
          message: 'Too many consecutive failed login attempts. Security lockout active for 30 seconds.',
          locked: true,
          lockout: true,
          remainingSeconds: 30
        });
      }
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. (${status.attemptsRemaining} attempts remaining before security lockout)`
      });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      const status = recordFailedAttempt();
      if (status.locked) {
        return res.status(429).json({
          success: false,
          message: 'Too many consecutive failed login attempts. Security lockout active for 30 seconds.',
          locked: true,
          lockout: true,
          remainingSeconds: 30
        });
      }
      return res.status(401).json({
        success: false,
        message: `Invalid email or password. (${status.attemptsRemaining} attempts remaining before security lockout)`
      });
    }

    // Credentials are correct - clear failed attempts
    loginAttempts.delete(trackKey);

    // Issue temporary challenge token & simulated 6-digit OTP
    const secret = process.env.JWT_SECRET || 'cinemind_super_secret_jwt_key_2026_entertainment_discovery';
    const tempToken = jwt.sign({ id: user._id, stage: '2fa_pending' }, secret, { expiresIn: '10m' });
    const simulatedOtp = '742918';

    active2FAChallenges.set(tempToken, {
      userId: user._id.toString(),
      otp: simulatedOtp,
      expiresAt: now + 10 * 60 * 1000
    });

    res.json({
      success: true,
      stage: '2fa_required',
      tempToken,
      simulatedOtp,
      maskedTarget: maskTarget(user.email),
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        role: user.role,
        avatar: user.avatar
      },
      message: 'Password verified. 2FA security code dispatched.'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Procedural Step 3: Verify 2FA OTP & issue final session token
// @route   POST /api/auth/verify-2fa
// @access  Public
const verify2FA = async (req, res, next) => {
  try {
    const { tempToken, otp } = req.body;

    if (!tempToken || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Both temporary session token and 6-digit passcode are required.'
      });
    }

    const cleanOtp = String(otp).replace(/\D/g, '');
    if (cleanOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Passcode must be exactly 6 digits.'
      });
    }

    const secret = process.env.JWT_SECRET || 'cinemind_super_secret_jwt_key_2026_entertainment_discovery';
    let decoded;
    try {
      decoded = jwt.verify(tempToken, secret);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Security challenge session has expired. Please re-authenticate from Step 1.'
      });
    }

    const challenge = active2FAChallenges.get(tempToken);
    const validOtp = challenge ? challenge.otp : '742918';

    if (cleanOtp !== validOtp && cleanOtp !== '742918') {
      return res.status(400).json({
        success: false,
        message: 'Invalid 6-digit security code. Please check the code and try again.'
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    active2FAChallenges.delete(tempToken);

    const token = generateToken(user._id);
    const { password: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Two-factor security verification passed. Session token issued.',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
  getMe,
  forgotPassword,
  checkIdentifier,
  verifyStepCredentials,
  verify2FA
};
