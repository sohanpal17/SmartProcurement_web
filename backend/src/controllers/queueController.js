const supabase = require('../config/supabase');
const queueStore = require('../config/queueStore');

// 1. GET QUEUE STATUS BY TOKEN NUMBER
exports.getQueueStatusByToken = async (req, res) => {
    try {
        const { tokenNumber } = req.params;

        // Check local store first
        const memRecord = queueStore.queueRecords.find((q) => q.token_number === tokenNumber);
        if (memRecord) {
            return res.status(200).json({
                success: true,
                queueRecord: {
                    tokenNumber: memRecord.token_number,
                    currentStageIndex: memRecord.current_stage,
                    peopleAhead: memRecord.people_ahead,
                    estimatedWaitMins: memRecord.estimated_wait_mins,
                    updatedAt: memRecord.updated_at,
                    bookingDetails: memRecord.bookings,
                },
            });
        }

        const { data: queue } = await supabase
            .from('queue_records')
            .select('*, bookings(*)')
            .eq('token_number', tokenNumber)
            .single();

        if (!queue) {
            return res.status(404).json({ success: false, error: 'Token not found in queue system' });
        }

        return res.status(200).json({
            success: true,
            queueRecord: {
                tokenNumber: queue.token_number,
                currentStageIndex: queue.current_stage,
                peopleAhead: queue.people_ahead,
                estimatedWaitMins: queue.estimated_wait_mins,
                updatedAt: queue.updated_at,
                bookingDetails: queue.bookings,
            },
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// 2. WEB ADMIN: UPDATE QUEUE STAGE (1 to 6) FOR A TOKEN
exports.updateQueueStageByAdmin = async (req, res) => {
    try {
        const { tokenNumber, newStageIndex } = req.body;

        if (!tokenNumber || !newStageIndex) {
            return res.status(400).json({ success: false, error: 'tokenNumber and newStageIndex are required.' });
        }

        const stage = parseInt(newStageIndex);
        if (stage < 1 || stage > 6) {
            return res.status(400).json({ success: false, error: 'newStageIndex must be between 1 and 6.' });
        }

        const updatedMem = queueStore.updateStage(tokenNumber, stage);

        try {
            await supabase
                .from('queue_records')
                .update({
                    current_stage: stage,
                    updated_at: new Date().toISOString(),
                })
                .eq('token_number', tokenNumber);
        } catch (e) {
            // Ignore DB error if memory updated
        }

        return res.status(200).json({
            success: true,
            message: `Queue stage for Token ${tokenNumber} updated to Stage ${stage}`,
            queueRecord: updatedMem,
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};

// 3. WEB ADMIN: GET ALL ACTIVE QUEUE TOKENS AT A MANDI
exports.getMandiQueueTokens = async (req, res) => {
    try {
        const { mandiId } = req.query;
        const memRecords = queueStore.getQueueRecords(mandiId);

        let dbRecords = [];
        try {
            let query = supabase.from('queue_records').select('*, bookings(*)').order('updated_at', { ascending: false });
            if (mandiId) {
                query = query.eq('mandi_id', mandiId.toLowerCase());
            }
            const { data } = await query;
            if (data && Array.isArray(data)) {
                dbRecords = data;
            }
        } catch (err) {
            // Memory records fallback
        }

        // Combine DB and Memory records (prefer updated memory store records)
        const combinedMap = new Map();
        dbRecords.forEach((r) => {
            if (r && r.token_number) {
                combinedMap.set(r.token_number.toLowerCase(), r);
            }
        });

        memRecords.forEach((r) => {
            if (r && r.token_number) {
                const key = r.token_number.toLowerCase();
                const existing = combinedMap.get(key);
                if (!existing || (r.current_stage || 1) >= (existing.current_stage || 1)) {
                    combinedMap.set(key, r);
                }
            }
        });

        const allRecords = Array.from(combinedMap.values());

        return res.status(200).json({
            success: true,
            count: allRecords.length,
            queueRecords: allRecords,
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
};
