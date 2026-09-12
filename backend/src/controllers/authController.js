const supabase = require('../config/supabase');
const jwt = require('jsonwebtoken');
const officerStore = require('../config/officerStore');
const { randomUUID } = require('crypto');

// In-memory registry for registered farmers and officers
const registeredUsersMap = new Map();

// Pre-configured Mandi Admin Accounts
const PRESEEDED_ADMINS = {
    'turbhe@gmail.com': { password: 'turbhe123', name: 'Turbhe Mandi Admin', mandiId: 'turbhe' },
    'vashi@gmail.com': { password: 'vashi123', name: 'Vashi Mandi Admin', mandiId: 'vashi' },
    'sanpada@gmail.com': { password: 'sanpada123', name: 'Sanpada Mandi Admin', mandiId: 'sanpada' },
};

// Pre-configured Turbhe Officer Accounts (Auto-Approved)
const PRESEEDED_OFFICERS = {
    'tofficer1@gmail.com': { password: '123456', name: 'Turbhe Arrival Officer', role: 'Arrival & Token Officer', mandiId: 'turbhe' },
    'tofficer2@gmail.com': { password: '123456', name: 'Turbhe Weighing Officer', role: 'Weighing Officer', mandiId: 'turbhe' },
    'tofficer3@gmail.com': { password: '123456', name: 'Turbhe Quality Officer', role: 'Quality Check Officer', mandiId: 'turbhe' },
    'tofficer5@gmail.com': { password: '123456', name: 'Turbhe Payment Officer', role: 'Payment Officer', mandiId: 'turbhe' },
};

// 1. REGISTER FARMER OR PROCUREMENT OFFICER (Email & Password Only Required)
exports.registerUser = async (req, res) => {
    try {
        const { email, password, fullName, phone, role = 'farmer', officerRole = 'Arrival & Token Officer', mandiId = 'turbhe' } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }

        const name = fullName && fullName.trim() ? fullName.trim() : email.split('@')[0];
        const contactPhone = phone && phone.trim() ? phone.trim() : `phone_${Date.now().toString().slice(-8)}`;

        // Officer requires a specific Mandi assignment
        if (role === 'officer' && !mandiId) {
            return res.status(400).json({ success: false, error: 'Mandi selection is required for Procurement Officers.' });
        }

        // Farmers are auto-approved. Officers require Admin Approval (is_approved = false).
        const isApproved = role === 'officer' ? false : true;
        const userId = randomUUID();

        const officerRecord = {
            id: userId,
            email: email.toLowerCase(),
            full_name: name,
            phone: contactPhone,
            role: role === 'officer' ? officerRole : role,
            officer_role: officerRole,
            mandi_id: mandiId.toLowerCase(),
            is_approved: isApproved,
            created_at: new Date().toISOString(),
        };

        const cleanEmail = email.toLowerCase().trim();
        const userEntry = {
            id: userId,
            email: cleanEmail,
            password: password.trim(),
            fullName: name,
            phone: contactPhone,
            role: role === 'officer' ? officerRole : role,
            officerRole,
            mandiId: mandiId ? mandiId.toLowerCase() : 'turbhe',
            isApproved,
        };

        registeredUsersMap.set(cleanEmail, userEntry);

        if (role === 'officer') {
            officerStore.addOfficer(officerRecord);
        }

        // Save Profile to Supabase if available
        try {
            await supabase.from('profiles').upsert([
                {
                    id: userId,
                    full_name: name,
                    phone: contactPhone,
                    role: role === 'officer' ? officerRole : role,
                    mandi_id: mandiId.toLowerCase(),
                    is_approved: isApproved,
                },
            ]);
        } catch (dbErr) {
            console.log('Supabase profile sync warning (using officerStore):', dbErr.message);
        }

        if (role === 'officer') {
            return res.status(201).json({
                success: true,
                message: 'Officer account created successfully. Waiting for Mandi Admin approval.',
                user: {
                    id: userId,
                    email,
                    fullName: name,
                    role: officerRole,
                    mandiId,
                    isApproved: false,
                },
            });
        }

        // Issue JWT for Farmers
        const token = jwt.sign(
            { id: userId, email, role, name: fullName, mandiId },
            process.env.JWT_SECRET || 'smartprocure_super_secret_jwt_key_2026',
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: userId,
                email,
                fullName: name,
                phone: contactPhone,
                role,
                isApproved: true,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// 2. LOGIN USER (Farmer, Mandi Admin, or Officer)
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }

        const cleanEmail = email.toLowerCase().trim();

        // Check for Pre-seeded Mandi Admins (turbhe@gmail.com, vashi@gmail.com, sanpada@gmail.com)
        if (PRESEEDED_ADMINS[cleanEmail]) {
            const adminInfo = PRESEEDED_ADMINS[cleanEmail];
            if (password === adminInfo.password) {
                const adminId = `admin_${adminInfo.mandiId}`;
                const token = jwt.sign(
                    { id: adminId, email: cleanEmail, role: 'admin', name: adminInfo.name, mandiId: adminInfo.mandiId },
                    process.env.JWT_SECRET || 'smartprocure_super_secret_jwt_key_2026',
                    { expiresIn: '7d' }
                );

                return res.status(200).json({
                    success: true,
                    message: `Welcome ${adminInfo.name}`,
                    token,
                    user: {
                        id: adminId,
                        email: cleanEmail,
                        fullName: adminInfo.name,
                        role: 'admin',
                        mandiId: adminInfo.mandiId,
                        isApproved: true,
                    },
                });
            } else {
                return res.status(401).json({ success: false, error: 'Invalid admin password.' });
            }
        }

        // Check for Pre-seeded Turbhe Officer Accounts (tofficer1@gmail.com - tofficer5@gmail.com)
        if (PRESEEDED_OFFICERS[cleanEmail]) {
            const officerInfo = PRESEEDED_OFFICERS[cleanEmail];
            if (password === officerInfo.password) {
                const officerId = `off_${cleanEmail.split('@')[0]}`;
                const token = jwt.sign(
                    { id: officerId, email: cleanEmail, role: officerInfo.role, name: officerInfo.name, mandiId: officerInfo.mandiId },
                    process.env.JWT_SECRET || 'smartprocure_super_secret_jwt_key_2026',
                    { expiresIn: '7d' }
                );

                return res.status(200).json({
                    success: true,
                    message: `Welcome ${officerInfo.name}`,
                    token,
                    user: {
                        id: officerId,
                        email: cleanEmail,
                        fullName: officerInfo.name,
                        role: officerInfo.role,
                        mandiId: officerInfo.mandiId,
                        isApproved: true,
                    },
                });
            } else {
                return res.status(401).json({ success: false, error: 'Invalid officer password.' });
            }
        }

        // Check registeredUsersMap for dynamic registered accounts (Farmers & Officers)
        if (registeredUsersMap.has(cleanEmail)) {
            const regUser = registeredUsersMap.get(cleanEmail);
            if (regUser.password === password) {
                if (!regUser.isApproved) {
                    return res.status(403).json({
                        success: false,
                        isPendingApproval: true,
                        error: 'Your Officer account is currently pending approval by the Mandi Admin.',
                    });
                }

                const token = jwt.sign(
                    { id: regUser.id, email: regUser.email, role: regUser.role, name: regUser.fullName, mandiId: regUser.mandiId },
                    process.env.JWT_SECRET || 'smartprocure_super_secret_jwt_key_2026',
                    { expiresIn: '7d' }
                );

                return res.status(200).json({
                    success: true,
                    token,
                    user: {
                        id: regUser.id,
                        email: regUser.email,
                        fullName: regUser.fullName,
                        role: regUser.role,
                        mandiId: regUser.mandiId,
                        isApproved: regUser.isApproved,
                    },
                });
            } else {
                return res.status(401).json({ success: false, error: 'Invalid email or password.' });
            }
        }

        // Check officerStore first for registered officers
        const memOfficer = officerStore.officers.find((o) => o.email === cleanEmail);
        if (memOfficer) {
            if (!memOfficer.is_approved) {
                return res.status(403).json({
                    success: false,
                    isPendingApproval: true,
                    error: 'Your Officer account is currently pending approval by the Mandi Admin.',
                });
            }

            const token = jwt.sign(
                { id: memOfficer.id, email: memOfficer.email, role: memOfficer.role, name: memOfficer.full_name, mandiId: memOfficer.mandi_id },
                process.env.JWT_SECRET || 'smartprocure_super_secret_jwt_key_2026',
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                success: true,
                token,
                user: {
                    id: memOfficer.id,
                    email: memOfficer.email,
                    fullName: memOfficer.full_name,
                    role: memOfficer.role,
                    mandiId: memOfficer.mandi_id,
                    isApproved: true,
                },
            });
        }

        // Supabase Auth Fallback
        const { data: authData } = await supabase.auth.signInWithPassword({ email, password });
        if (authData && authData.user) {
            const user = authData.user;
            const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            const role = profile ? profile.role : 'farmer';
            const isApproved = profile ? profile.is_approved : true;
            const fullName = profile ? profile.full_name : user.email.split('@')[0];
            const mandiId = profile ? profile.mandi_id : null;

            if (role === 'officer' && !isApproved) {
                return res.status(403).json({
                    success: false,
                    isPendingApproval: true,
                    error: 'Your Officer account is currently pending approval by the Mandi Admin.',
                });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role, name: fullName, mandiId },
                process.env.JWT_SECRET || 'smartprocure_super_secret_jwt_key_2026',
                { expiresIn: '7d' }
            );

            return res.status(200).json({
                success: true,
                token,
                user: { id: user.id, email: user.email, fullName, role, mandiId, isApproved },
            });
        }

        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// 3. MANDI ADMIN: GET PENDING OFFICER REGISTRATIONS
exports.getPendingOfficers = async (req, res) => {
    try {
        const adminMandiId = req.query.mandiId || req.user?.mandiId;
        const memPending = officerStore.getPendingOfficers(adminMandiId);

        let dbPending = [];
        try {
            let query = supabase.from('profiles').select('*').eq('is_approved', false);
            if (adminMandiId) query = query.eq('mandi_id', adminMandiId.toLowerCase());
            const { data } = await query;
            if (data && Array.isArray(data)) dbPending = data;
        } catch (e) {
            // DB fallback
        }

        const combinedMap = new Map();
        [...memPending, ...dbPending].forEach((o) => {
            if (o && o.id) combinedMap.set(o.id, o);
        });

        const pendingOfficers = Array.from(combinedMap.values());
        return res.status(200).json({ success: true, count: pendingOfficers.length, officers: pendingOfficers });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// 4. MANDI ADMIN: APPROVE OR REJECT OFFICER
exports.approveOfficer = async (req, res) => {
    try {
        const { officerId, approve = true } = req.body;

        if (!officerId) {
            return res.status(400).json({ success: false, error: 'officerId is required.' });
        }

        const updatedMem = officerStore.approveOfficer(officerId, approve);

        try {
            await supabase.from('profiles').update({ is_approved: approve }).eq('id', officerId);
        } catch (e) {
            // DB warning
        }

        return res.status(200).json({
            success: true,
            message: approve ? 'Officer account approved successfully.' : 'Officer account rejected.',
            profile: updatedMem,
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// 5. GET USER PROFILE
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error || !profile) {
            return res.status(200).json({
                success: true,
                profile: {
                    id: userId,
                    role: req.user.role || 'farmer',
                    full_name: req.user.name || 'User',
                    mandi_id: req.user.mandiId || null,
                    is_approved: req.user.isApproved !== undefined ? req.user.isApproved : true,
                },
            });
        }

        return res.status(200).json({ success: true, profile });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
