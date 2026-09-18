const supabase = require('../config/supabase');
const queueStore = require('../config/queueStore');
const { randomUUID } = require('crypto');

// Helper to check if string is valid UUID
function isValidUUID(str) {
    if (!str) return false;
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(str);
}

function getNextTokenNumber(mandiPrefix = 'TBR') {
    queueStore.purgeToken1045();
    const existingTokens = queueStore.bookings.map((b) => b.token_number || '');
    let maxNum = 1044;
    existingTokens.forEach((t) => {
        const match = t.match(/(\d+)/);
        if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
        }
    });
    const nextNum = maxNum + 1;
    return `${(mandiPrefix || 'TBR').toUpperCase()}-${nextNum}`;
}

// 1. CREATE BOOKING & GENERATE TOKEN
exports.createBooking = async (req, res) => {
    try {
        const {
            farmerId,
            farmerName,
            commodityId,
            commodityName,
            quantityQuintals,
            mandiId,
            mandiName,
            dateKey,
            batchId,
            timeRange,
            mandiPrefix = 'TBR',
            tokenNumber: passedTokenNumber,
        } = req.body;

        if (!commodityId || !quantityQuintals || !mandiId || !dateKey || !batchId) {
            return res.status(400).json({ success: false, error: 'Missing required booking parameters.' });
        }

        const qty = parseFloat(quantityQuintals);
        const availId = `${mandiId}_${dateKey}_${batchId}`;

        // Generate Proper Sequential Token Number (e.g. TBR-1045)
        const tokenNumber = passedTokenNumber || getNextTokenNumber(mandiPrefix);
        const bookingRef = `BK-${Date.now().toString().slice(-6)}`;
        const bookingId = randomUUID();
        const safeFarmerUUID = isValidUUID(farmerId) ? farmerId : '00000000-0000-0000-0000-000000000000';

        const bookingObj = {
            id: bookingId,
            booking_ref: bookingRef,
            farmer_id: safeFarmerUUID,
            display_farmer_id: farmerId || 'FMR-7128912345',
            farmer_name: farmerName || 'Farmer',
            commodity_id: commodityId,
            commodity_name: commodityName || commodityId,
            quantity_quintals: qty,
            mandi_id: mandiId.toLowerCase(),
            mandi_name: mandiName || mandiId,
            date_key: dateKey,
            batch_id: batchId,
            time_range: timeRange || '07:00 AM – 08:00 AM',
            token_number: tokenNumber,
            status: 'Confirmed',
            created_at: new Date().toISOString(),
        };

        const queueObj = {
            id: randomUUID(),
            booking_id: bookingId,
            token_number: tokenNumber,
            mandi_id: mandiId.toLowerCase(),
            current_stage: 1, // Stage 1: Booked
            people_ahead: Math.floor(Math.random() * 5) + 1,
            estimated_wait_mins: Math.floor(Math.random() * 45) + 15,
            updated_at: new Date().toISOString(),
            bookings: bookingObj,
        };

        // Always store in active memory store for 100% instant web dashboard visibility!
        queueStore.addBookingAndToken(bookingObj, queueObj);

        // Attempt Supabase database insert if available
        try {
            await supabase.from('bookings').insert([bookingObj]);
            await supabase.from('queue_records').insert([
                {
                    id: queueObj.id,
                    booking_id: bookingId,
                    token_number: tokenNumber,
                    mandi_id: mandiId.toLowerCase(),
                    current_stage: 1,
                    people_ahead: queueObj.people_ahead,
                    estimated_wait_mins: queueObj.estimated_wait_mins,
                },
            ]);
        } catch (dbErr) {
            console.log('Supabase sync warning (using memory queueStore):', dbErr.message);
        }

        return res.status(201).json({
            success: true,
            message: 'Booking created and token issued to live queue successfully',
            tokenNumber,
            booking: bookingObj,
            queueRecord: queueObj,
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// 2. GET BATCH AVAILABILITIES
exports.getAvailabilities = async (req, res) => {
    try {
        const { mandiId, dateKey } = req.query;

        let query = supabase.from('batch_availabilities').select('*');
        if (mandiId) query = query.eq('mandi_id', mandiId);
        if (dateKey) query = query.eq('date_key', dateKey);

        const { data, error } = await query;

        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        return res.status(200).json({ success: true, availabilities: data });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// 3. GET FARMER BOOKINGS
exports.getFarmerBookings = async (req, res) => {
    try {
        const farmerId = req.user?.id;

        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('farmer_id', farmerId)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(500).json({ success: false, error: error.message });
        }

        return res.status(200).json({ success: true, bookings });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// 4. CANCEL BOOKING (For Farmers / Mobile App / Web Admin)
exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId, tokenNumber, farmerId } = req.body;

        if (!bookingId && !tokenNumber) {
            return res.status(400).json({ success: false, error: 'bookingId or tokenNumber is required to cancel a booking.' });
        }

        const targetKey = bookingId || tokenNumber;

        // 1. Remove from active memory queueStore
        queueStore.removeBookingOrToken(targetKey);

        // 2. Update status in Supabase if database connection is available
        try {
            if (bookingId) {
                await supabase.from('bookings').update({ status: 'Cancelled' }).eq('id', bookingId);
                await supabase.from('queue_records').delete().eq('booking_id', bookingId);
            } else if (tokenNumber) {
                await supabase.from('bookings').update({ status: 'Cancelled' }).eq('token_number', tokenNumber);
                await supabase.from('queue_records').delete().eq('token_number', tokenNumber);
            }
        } catch (dbErr) {
            console.log('Supabase cancel sync warning (using memory queueStore):', dbErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `Booking ${tokenNumber || bookingId} cancelled successfully.`,
            cancelledKey: targetKey,
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
