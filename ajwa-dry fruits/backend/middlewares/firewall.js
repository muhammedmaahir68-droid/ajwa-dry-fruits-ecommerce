/**
 * ==============================================================================
 * Ajwa AI Commerce - Web Application Firewall (WAF) & Security Shield
 * Provides:
 * 1. HTTP Security Headers Hardening (HSTS, Anti-Clickjacking, NoSniff)
 * 2. SQL Injection & Cross-Site Scripting (XSS) Sanitization
 * 3. Malicious Vulnerability Scanner & Bot Blocker
 * 4. Adaptive Sliding-Window Rate Limiting (Anti-DDoS & Brute Force Defense)
 * ==============================================================================
 */

// In-memory sliding window request tracker for DDoS & brute force prevention
const ipRequestWindow = new Map();
const authAttemptWindow = new Map();

// Known malicious vulnerability scanner user-agent patterns
const MALICIOUS_USER_AGENTS = [
    /sqlmap/i,
    /nikto/i,
    /dirbuster/i,
    /nmap/i,
    /masscan/i,
    /wpscan/i,
    /acunetix/i,
    /nessus/i,
    /havij/i,
    /netsparker/i
];

// Dangerous SQL injection & XSS regex patterns
const INJECTION_PATTERNS = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,                         // SQL comment/quote bypass
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,     // Tautology SQLi
    /\w*((\%27)|(\'))(\s)*((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i, // OR '1'='1'
    /((\%27)|(\'))(\s)*(union|select|insert|delete|drop|update)/i, // Union/DML injection
    /<script\b[^>]*>(.*?)<\/script>/i,                         // Script tag XSS
    /javascript\s*:/i,                                         // Javascript pseudo-protocol
    /onload\s*=/i,                                             // Event handlers
    /onerror\s*=/i,
    /\.\.\/|\.\.\\/i                                           // Path traversal
];

// Helper to inspect string or nested object for malicious injection signatures
function containsInjectionPayload(val) {
    if (!val) return false;
    if (typeof val === 'string') {
        // Skip check for valid email, UUIDs or passwords that may naturally contain harmless characters
        if (val.length > 500) return true; // Extreme payload size restriction
        return INJECTION_PATTERNS.some(regex => regex.test(val));
    }
    if (typeof val === 'object' && val !== null) {
        for (const key of Object.keys(val)) {
            // Check keys themselves
            if (INJECTION_PATTERNS.some(regex => regex.test(key))) return true;
            // Check values recursively
            if (containsInjectionPayload(val[key])) return true;
        }
    }
    return false;
}

const firewallMiddleware = (req, res, next) => {
    // --------------------------------------------------------------------------
    // 1. Hardened HTTP Security Headers
    // --------------------------------------------------------------------------
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'geolocation=(), camera=(), microphone=()');
    res.setHeader('X-Firewall-Status', 'ACTIVE_SHIELD_2026');

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || '127.0.0.1';
    const userAgent = req.headers['user-agent'] || '';

    // --------------------------------------------------------------------------
    // 2. Malicious Bot & Vulnerability Scanner Blocker
    // --------------------------------------------------------------------------
    if (MALICIOUS_USER_AGENTS.some(regex => regex.test(userAgent))) {
        console.warn(`[WAF ALERT] Blocked malicious scanner probe from IP: ${clientIp} (User-Agent: ${userAgent})`);
        return res.status(403).json({
            success: false,
            firewall_alert: 'FORBIDDEN_AUTOMATED_SCANNER_BLOCKED',
            message: 'Access blocked by Ajwa Enterprise Web Application Firewall.'
        });
    }

    // --------------------------------------------------------------------------
    // 3. Sliding Window Rate Limiting (Anti-DDoS & Brute Force Protection)
    // --------------------------------------------------------------------------
    const now = Date.now();
    const WINDOW_MS = 5 * 60 * 1000; // 5 minute window
    const MAX_REQUESTS = 250;        // Max requests per window per IP

    const clientHistory = ipRequestWindow.get(clientIp) || [];
    const recentRequests = clientHistory.filter(timestamp => now - timestamp < WINDOW_MS);
    recentRequests.push(now);
    ipRequestWindow.set(clientIp, recentRequests);

    if (recentRequests.length > MAX_REQUESTS) {
        console.warn(`[WAF ALERT] Rate limit exceeded by IP: ${clientIp} (${recentRequests.length} reqs/5min)`);
        return res.status(429).json({
            success: false,
            firewall_alert: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests detected. Security throttle active. Please try again in 5 minutes.'
        });
    }

    // Sensitive Auth Route Brute Force Throttling (/api/v1/login)
    if (req.path === '/api/v1/login' && req.method === 'POST') {
        const authHistory = authAttemptWindow.get(clientIp) || [];
        const recentAuthAttempts = authHistory.filter(timestamp => now - timestamp < (10 * 60 * 1000));
        recentAuthAttempts.push(now);
        authAttemptWindow.set(clientIp, recentAuthAttempts);

        if (recentAuthAttempts.length > 15) {
            console.warn(`[WAF ALERT] Auth brute-force locked out for IP: ${clientIp}`);
            return res.status(429).json({
                success: false,
                firewall_alert: 'AUTH_BRUTE_FORCE_LOCKOUT',
                message: 'Account authentication temporarily locked due to multiple attempts. Try again in 10 minutes.'
            });
        }
    }

    // --------------------------------------------------------------------------
    // 4. SQL Injection & Malicious Script Sanitization
    // --------------------------------------------------------------------------
    // Inspect query params, body and route params (skip password fields from regex check)
    const bodyCopy = { ...req.body };
    delete bodyCopy.password;
    delete bodyCopy.confirmPassword;

    if (containsInjectionPayload(req.query) || containsInjectionPayload(bodyCopy)) {
        console.warn(`[WAF ALERT] Malicious payload rejected from IP: ${clientIp} on path: ${req.originalUrl}`);
        return res.status(403).json({
            success: false,
            firewall_alert: 'INJECTION_ATTACK_DETECTED_AND_BLOCKED',
            message: 'Malicious payload signature detected and blocked by Ajwa Firewall.'
        });
    }

    // Periodic memory garbage collection
    if (ipRequestWindow.size > 2000) {
        for (const [ip, history] of ipRequestWindow.entries()) {
            if (history.length === 0 || now - history[history.length - 1] > WINDOW_MS) {
                ipRequestWindow.delete(ip);
            }
        }
    }

    next();
};

module.exports = firewallMiddleware;
