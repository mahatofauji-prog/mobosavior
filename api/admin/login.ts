export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { password } = req.body;
    
    // Validate password securely on the backend
    // This value can be overridden by a Vercel Environment Variable: ADMIN_PASSWORD
    const backendAdminSecret = process.env.ADMIN_PASSWORD || 'Mobofounder@2026';
    
    if (password === backendAdminSecret) {
      // Return a success response
      return res.status(200).json({ success: true, token: 'session_active' });
    } else {
      return res.status(401).json({ success: false, message: 'Invalid admin password.' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}
