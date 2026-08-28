const express = require("express");
const cors = require("cors");

const pool = require("./db");

const app = express();


// ============================================================
// SMARTPROCURE CONFIGURATION
// ============================================================

// Procurement windows.
//
// These capacities are QUANTITY capacities, not farmer counts.
//
// Example:
// Morning can process up to 60 Q.
//
// Centre daily_capacity is a separate limit for number of
// farmers/bookings per day.

const WINDOWS = {

    MORNING: {
        start: "09:00",
        end: "12:00",
        grace_until: "11:30",
        capacity: 60
    },

    AFTERNOON: {
        start: "11:30",
        end: "16:00",
        grace_until: "15:30",
        capacity: 60
    },

    EVENING: {
        start: "15:30",
        end: "19:00",
        grace_until: "19:00",
        capacity: 60
    }

};


// Order used when searching for a slot.

const WINDOW_ORDER = [
    "MORNING",
    "AFTERNOON",
    "EVENING"
];


// Bookings that currently occupy capacity/queue.

const ACTIVE_STATUSES = [
    "BOOKED",
    "CONFIRMED",
    "ARRIVED",
    "WAITING"
];


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(cors());

app.use(express.json());


// ============================================================
// HELPER FUNCTIONS
// ============================================================


// Convert HH:MM into minutes.
//
// Example:
// 09:30 -> 570

function timeToMinutes(time) {

    const [hours, minutes] =
        String(time).split(":").map(Number);

    return hours * 60 + minutes;
}


// Convert minutes into HH:MM.
//
// Example:
// 570 -> 09:30

function minutesToTime(totalMinutes) {

    const hours =
        Math.floor(totalMinutes / 60);

    const minutes =
        totalMinutes % 60;

    return (
        `${String(hours).padStart(2, "0")}:` +
        `${String(minutes).padStart(2, "0")}`
    );
}


// Calculate processing duration.
//
// Quantity is in quintals.
//
// 1-5 Q     = 10 minutes
// 6-10 Q    = 15 minutes
// 11-20 Q   = 20 minutes
// 21-30 Q   = 30 minutes
// 31-40 Q   = 40 minutes
// 41+ Q     = 50 minutes

function calculateDuration(quantity) {

    const q = Number(quantity);

    if (q <= 5) {
        return 10;
    }

    if (q <= 10) {
        return 15;
    }

    if (q <= 20) {
        return 20;
    }

    if (q <= 30) {
        return 30;
    }

    if (q <= 40) {
        return 40;
    }

    return 50;
}


// Generate a booking ID.
//
// Example:
// SP-20260829-123456789

function generateBookingId() {

    return (
        "SP-" +
        Date.now() +
        "-" +
        Math.floor(Math.random() * 1000)
    );
}


// ============================================================
// BASIC ROUTES
// ============================================================


// Home route.

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "SmartProcure backend is running",

        server:
            "Node.js + Express",

        database:
            "PostgreSQL"

    });

});


// ============================================================
// POSTGRESQL CONNECTION TEST
// ============================================================


// GET /api/test-db

app.get("/api/test-db", async (req, res) => {

    try {

        const result =
            await pool.query(`
                SELECT
                    NOW() AS database_time,
                    current_database() AS database_name,
                    current_user AS database_user
            `);

        res.json({

            success: true,

            message:
                "PostgreSQL connected successfully",

            databaseTime:
                result.rows[0].database_time,

            databaseName:
                result.rows[0].database_name,

            databaseUser:
                result.rows[0].database_user

        });

    } catch (error) {

        console.error(
            "PostgreSQL connection error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Database connection failed",

            error:
                error.message

        });

    }

});


// ============================================================
// POSTGRESQL TABLE CHECK
// ============================================================


// This endpoint helps us verify that the required tables exist.
//
// GET /api/test-tables

app.get("/api/test-tables", async (req, res) => {

    try {

        const result =
            await pool.query(`
                SELECT
                    table_name
                FROM information_schema.tables
                WHERE table_schema = 'public'
                ORDER BY table_name
            `);

        res.json({

            success: true,

            tables:
                result.rows.map(
                    row => row.table_name
                )

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Could not check PostgreSQL tables",

            error:
                error.message

        });

    }

});


// ============================================================
// FARMER DEBUG / LOOKUP
// ============================================================


// GET /api/farmers
//
// This is useful for testing which farmer IDs actually exist.

app.get("/api/farmers", async (req, res) => {

    try {

        const result =
            await pool.query(`
                SELECT
                    id,
                    farmer_id,
                    name
                FROM farmers
                ORDER BY id
            `);

        res.json({

            success: true,

            farmers:
                result.rows

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch farmers",

            error:
                error.message

        });

    }

});


// ============================================================
// GET ALL CENTRES
// ============================================================


// GET /api/centres

app.get("/api/centres", async (req, res) => {

    try {

        const result =
            await pool.query(`

                SELECT

                    c.id,

                    c.name,

                    c.latitude,

                    c.longitude,

                    c.daily_capacity,

                    c.working_start,

                    c.working_end,

                    c.status,

                    COUNT(b.id)
                        AS current_bookings

                FROM centres c

                LEFT JOIN bookings b

                    ON c.id = b.centre_id

                    AND b.booking_date::date =
                        CURRENT_DATE

                    AND b.status IN (
                        'BOOKED',
                        'CONFIRMED',
                        'ARRIVED',
                        'WAITING'
                    )

                GROUP BY

                    c.id,
                    c.name,
                    c.latitude,
                    c.longitude,
                    c.daily_capacity,
                    c.working_start,
                    c.working_end,
                    c.status

                ORDER BY c.id

            `);


        const centres =
            result.rows.map(centre => {

                const currentBookings =
                    Number(
                        centre.current_bookings
                    );

                const dailyCapacity =
                    Number(
                        centre.daily_capacity
                    );

                const loadPercentage =
                    dailyCapacity > 0
                        ? Math.round(
                            (
                                currentBookings /
                                dailyCapacity
                            ) * 100
                        )
                        : 0;


                return {

                    id:
                        centre.id,

                    name:
                        centre.name,

                    latitude:
                        centre.latitude,

                    longitude:
                        centre.longitude,

                    daily_capacity:
                        dailyCapacity,

                    current_bookings:
                        currentBookings,

                    load_percentage:
                        loadPercentage,

                    working_start:
                        centre.working_start,

                    working_end:
                        centre.working_end,

                    status:
                        centre.status

                };

            });


        res.json({

            success: true,

            centres

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message:
                "Failed to fetch centres",

            error:
                error.message

        });

    }

});


// ============================================================
// SCHEDULE ENGINE
// ============================================================


// Find an available procurement window.
//
// It checks:
//
// 1. Quantity capacity
// 2. Processing time
// 3. Queue position
// 4. Window end time
//
// If the preferred window is full,
// it automatically checks later windows.

async function findSchedule(
    centreId,
    bookingDate,
    preferredWindow,
    quantity
) {

    const requestedQuantity =
        Number(quantity);

    const duration =
        calculateDuration(
            requestedQuantity
        );


    let startIndex =
        WINDOW_ORDER.indexOf(
            preferredWindow
        );


    if (startIndex === -1) {

        startIndex = 0;

    }


    for (
        let i = startIndex;
        i < WINDOW_ORDER.length;
        i++
    ) {

        const windowName =
            WINDOW_ORDER[i];

        const window =
            WINDOWS[windowName];


        // ----------------------------------------------------
        // Get current window usage.
        // ----------------------------------------------------

        const result =
            await pool.query(

                `SELECT

                    COALESCE(
                        SUM(quantity),
                        0
                    ) AS used_capacity,

                    COALESCE(
                        SUM(estimated_duration),
                        0
                    ) AS used_duration,

                    COUNT(*) AS farmer_count

                 FROM bookings

                 WHERE centre_id = $1

                 AND booking_date::date =
                     $2::date

                 AND preferred_window = $3

                 AND status IN (
                     'BOOKED',
                     'CONFIRMED',
                     'ARRIVED',
                     'WAITING'
                 )`,

                [
                    centreId,
                    bookingDate,
                    windowName
                ]

            );


        const usedCapacity =
            Number(
                result.rows[0].used_capacity
            );


        const usedDuration =
            Number(
                result.rows[0].used_duration
            );


        const farmerCount =
            Number(
                result.rows[0].farmer_count
            );


        // ----------------------------------------------------
        // Quantity capacity.
        // ----------------------------------------------------

        const remainingCapacity =
            window.capacity -
            usedCapacity;


        if (
            requestedQuantity >
            remainingCapacity
        ) {

            // Not enough quantity capacity.
            // Try next window.

            continue;

        }


        // ----------------------------------------------------
        // Calculate scheduled start.
        // ----------------------------------------------------

        const windowStart =
            timeToMinutes(
                window.start
            );


        const windowEnd =
            timeToMinutes(
                window.end
            );


        const scheduledStart =
            windowStart +
            usedDuration;


        // ----------------------------------------------------
        // Check time capacity.
        // ----------------------------------------------------

        if (
            scheduledStart + duration >
            windowEnd
        ) {

            // This window cannot finish the farmer's
            // processing before closing.

            continue;

        }


        // ----------------------------------------------------
        // Queue position.
        // ----------------------------------------------------

        const queuePosition =
            farmerCount + 1;


        return {

            window:
                windowName,

            scheduledTime:
                minutesToTime(
                    scheduledStart
                ),

            graceUntil:
                window.grace_until,

            queuePosition,

            remainingCapacity,

            usedCapacity,

            usedDuration,

            duration

        };

    }


    return null;
}


// ============================================================
// CREATE BOOKING
// ============================================================


// POST /api/bookings

app.post("/api/bookings", async (req, res) => {

    try {

        const {

            farmer_id,

            centre_id,

            commodity,

            quantity,

            booking_date,

            preferred_window

        } = req.body;


        console.log(
            "Incoming booking:",
            req.body
        );


        // ----------------------------------------------------
        // Validate required fields.
        // ----------------------------------------------------

        if (
            farmer_id === undefined ||
            centre_id === undefined ||
            !commodity ||
            quantity === undefined ||
            !booking_date
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Missing required booking details",

                required: [
                    "farmer_id",
                    "centre_id",
                    "commodity",
                    "quantity",
                    "booking_date"
                ]

            });

        }


        // ----------------------------------------------------
        // Validate quantity.
        //
        // NOTE: this block was accidentally dropped in a
        // previous edit. It MUST run before calculateDuration()
        // is ever called, otherwise requestedQuantity is
        // undefined and the booking crashes with a 500.
        // ----------------------------------------------------

        const requestedQuantity =
            Number(quantity);


        if (
            !Number.isFinite(
                requestedQuantity
            ) ||
            requestedQuantity <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Quantity must be a number greater than zero"

            });

        }


        // ----------------------------------------------------
        // Validate IDs.
        //
        // farmer_id is a public-facing code (e.g. "FMR-1001"),
        // stored as text in the farmers table -- it is NOT
        // numeric, so it must be validated/compared as a string.
        // centre_id is the internal integer PK on centres.
        // ----------------------------------------------------

        const farmerPublicId =
            String(farmer_id).trim();

        const centreId =
            Number(centre_id);


        if (!farmerPublicId) {

            return res.status(400).json({

                success: false,

                message:
                    "farmer_id must be provided"

            });

        }


        if (
            !Number.isInteger(
                centreId
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "centre_id must be a valid number"

            });

        }


        // ----------------------------------------------------
        // Check centre.
        // ----------------------------------------------------

        const centreResult =
            await pool.query(

                `SELECT *
                 FROM centres
                 WHERE id = $1`,

                [centreId]

            );


        if (
            centreResult.rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    `Centre ${centreId} not found`

            });

        }


        const centre =
            centreResult.rows[0];


        // ----------------------------------------------------
        // Check farmer using PUBLIC farmer_id.
        //
        // Example:
        //
        // API sends:
        // farmer_id = "FMR-1001"
        //
        // Database:
        //
        // id = 2                    (internal integer PK)
        // farmer_id = "FMR-1001"    (public text code)
        //
        // We use id = 2 when inserting the booking.
        // ----------------------------------------------------

        const farmerResult =
            await pool.query(

                `SELECT
                    id,
                    farmer_id,
                    name
                 FROM farmers
                 WHERE farmer_id = $1`,

                [farmerPublicId]

            );


        if (
            farmerResult.rows.length === 0
        ) {

            return res.status(404).json({

                success: false,

                message:
                    `Farmer ${farmerPublicId} not found`,

                hint:
                    "Use GET /api/farmers to see valid farmer_id values"

            });

        }


        const farmer =
            farmerResult.rows[0];


        const farmerDatabaseId =
            farmer.id;


        // ----------------------------------------------------
        // Check daily centre capacity.
        //
        // daily_capacity = number of farmers.
        // ----------------------------------------------------

        const countResult =
            await pool.query(

                `SELECT
                    COUNT(*) AS count

                 FROM bookings

                 WHERE centre_id = $1

                 AND booking_date::date =
                     $2::date

                 AND status IN (
                     'BOOKED',
                     'CONFIRMED',
                     'ARRIVED',
                     'WAITING'
                 )`,

                [
                    centreId,
                    booking_date
                ]

            );


        const currentBookings =
            Number(
                countResult.rows[0].count
            );


        if (
            currentBookings >=
            Number(
                centre.daily_capacity
            )
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `${centre.name} has reached its daily farmer capacity`

            });

        }


        // ----------------------------------------------------
        // Calculate duration.
        // ----------------------------------------------------

        const estimatedDuration =
            calculateDuration(
                requestedQuantity
            );


        // ----------------------------------------------------
        // Find schedule.
        // ----------------------------------------------------

        const schedule =
            await findSchedule(

                centreId,

                booking_date,

                preferred_window ||
                    "MORNING",

                requestedQuantity

            );


        if (!schedule) {

            return res.status(400).json({

                success: false,

                message:
                    "No capacity available in the selected or later windows",

                details: {

                    requested_quantity:
                        requestedQuantity,

                    preferred_window:
                        preferred_window ||
                        "MORNING",

                    estimated_duration:
                        estimatedDuration

                }

            });

        }


        // ----------------------------------------------------
        // Generate booking ID.
        // ----------------------------------------------------

        const bookingId =
            generateBookingId();


        // ----------------------------------------------------
        // Token.
        //
        // Token starts from 1 inside each procurement window.
        // ----------------------------------------------------

        const tokenNo =
            schedule.queuePosition;


        // ----------------------------------------------------
        // Insert booking.
        // ----------------------------------------------------

        const result =
            await pool.query(

                `INSERT INTO bookings
                (
                    booking_id,
                    farmer_id,
                    centre_id,
                    commodity,
                    quantity,
                    booking_date,
                    preferred_window,
                    token_no,
                    estimated_duration,
                    scheduled_time,
                    window_capacity,
                    grace_until,
                    queue_position
                )

                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,
                    $5,
                    $6,
                    $7,
                    $8,
                    $9,
                    $10,
                    $11,
                    $12,
                    $13
                )

                RETURNING *`,

                [

                    bookingId,

                    farmerDatabaseId,

                    centreId,

                    commodity,

                    requestedQuantity,

                    booking_date,

                    schedule.window,

                    tokenNo,

                    estimatedDuration,

                    schedule.scheduledTime,

                    WINDOWS[
                        schedule.window
                    ].capacity,

                    schedule.graceUntil,

                    schedule.queuePosition

                ]

            );


        // ----------------------------------------------------
        // Success response.
        // ----------------------------------------------------

        res.status(201).json({

            success: true,

            message:
                "Booking created successfully",

            booking:
                result.rows[0],

            farmer: {

                id:
                    farmer.farmer_id,

                name:
                    farmer.name

            },

            centre: {

                id:
                    centre.id,

                name:
                    centre.name

            },

            scheduling: {

                window:
                    schedule.window,

                token:
                    tokenNo,

                scheduled_time:
                    schedule.scheduledTime,

                grace_until:
                    schedule.graceUntil,

                estimated_duration:
                    estimatedDuration,

                remaining_window_capacity:
                    schedule.remainingCapacity

            }

        });

    } catch (error) {

        console.error(
            "BOOKING ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to create booking",

            error:
                error.message

        });

    }

});


// ============================================================
// CENTRE QUEUE
// ============================================================


// GET /api/centres/:id/queue

app.get(
    "/api/centres/:id/queue",
    async (req, res) => {

        try {

            const centreId =
                Number(req.params.id);


            if (
                !Number.isInteger(
                    centreId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid centre ID"

                });

            }


            // ------------------------------------------------
            // Centre.
            // ------------------------------------------------

            const centreResult =
                await pool.query(

                    `SELECT *
                     FROM centres
                     WHERE id = $1`,

                    [centreId]

                );


            if (
                centreResult.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        `Centre ${centreId} not found`

                });

            }


            const centre =
                centreResult.rows[0];


            // ------------------------------------------------
            // Today's active queue.
            // ------------------------------------------------

            const bookingsResult =
                await pool.query(

                    `SELECT

                        b.id,

                        b.booking_id,

                        f.farmer_id,

                        f.name AS farmer_name,

                        b.commodity,

                        b.quantity,

                        b.token_no,

                        b.queue_position,

                        b.preferred_window,

                        b.scheduled_time,

                        b.grace_until,

                        b.estimated_duration,

                        b.status,

                        b.booking_date

                     FROM bookings b

                     JOIN farmers f
                        ON b.farmer_id = f.id

                     WHERE b.centre_id = $1

                     AND b.booking_date::date =
                         CURRENT_DATE

                     AND b.status IN (
                         'BOOKED',
                         'CONFIRMED',
                         'ARRIVED',
                         'WAITING'
                     )

                     ORDER BY

                        CASE
                            WHEN b.preferred_window =
                                'MORNING'
                            THEN 1

                            WHEN b.preferred_window =
                                'AFTERNOON'
                            THEN 2

                            ELSE 3

                        END,

                        b.token_no`,

                    [centreId]

                );


            const currentBookings =
                bookingsResult.rows.length;


            const dailyCapacity =
                Number(
                    centre.daily_capacity
                );


            const loadPercentage =
                dailyCapacity > 0
                    ? Math.round(
                        (
                            currentBookings /
                            dailyCapacity
                        ) * 100
                    )
                    : 0;


            // ------------------------------------------------
            // Group bookings by window.
            // ------------------------------------------------

            const windows = {

                MORNING: [],

                AFTERNOON: [],

                EVENING: []

            };


            for (
                const booking
                of bookingsResult.rows
            ) {

                if (
                    windows[
                        booking.preferred_window
                    ]
                ) {

                    windows[
                        booking.preferred_window
                    ].push(
                        booking
                    );

                }

            }


            res.json({

                success: true,

                centre: {

                    id:
                        centre.id,

                    name:
                        centre.name,

                    daily_capacity:
                        dailyCapacity,

                    current_bookings:
                        currentBookings,

                    load_percentage:
                        loadPercentage

                },

                windows,

                queue:
                    bookingsResult.rows

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch queue",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// LOAD BALANCER
// ============================================================


// GET /api/load-balancer

app.get(
    "/api/load-balancer",
    async (req, res) => {

        try {

            const result =
                await pool.query(`

                    SELECT

                        c.id,

                        c.name,

                        c.daily_capacity,

                        COUNT(b.id)
                            AS current_bookings

                    FROM centres c

                    LEFT JOIN bookings b

                        ON c.id = b.centre_id

                        AND b.booking_date::date =
                            CURRENT_DATE

                        AND b.status IN (
                            'BOOKED',
                            'CONFIRMED',
                            'ARRIVED',
                            'WAITING'
                        )

                    GROUP BY

                        c.id,
                        c.name,
                        c.daily_capacity

                    ORDER BY c.id

                `);


            const centres =
                result.rows.map(centre => {

                    const currentBookings =
                        Number(
                            centre.current_bookings
                        );


                    const dailyCapacity =
                        Number(
                            centre.daily_capacity
                        );


                    const loadPercentage =
                        dailyCapacity > 0
                            ? Math.round(
                                (
                                    currentBookings /
                                    dailyCapacity
                                ) * 100
                            )
                            : 0;


                    return {

                        id:
                            centre.id,

                        name:
                            centre.name,

                        daily_capacity:
                            dailyCapacity,

                        current_bookings:
                            currentBookings,

                        load_percentage:
                            loadPercentage

                    };

                });


            if (
                centres.length === 0
            ) {

                return res.json({

                    success: true,

                    centres: [],

                    overloaded: [],

                    recommended: null,

                    message:
                        "No procurement centres found"

                });

            }


            // ------------------------------------------------
            // Centres >= 80% are considered overloaded.
            // ------------------------------------------------

            const overloaded =
                centres.filter(
                    centre =>
                        centre.load_percentage >= 80
                );


            // ------------------------------------------------
            // Lowest load = recommended centre.
            // ------------------------------------------------

            const recommended =
                centres.reduce(
                    (lowest, centre) => {

                        if (
                            centre.load_percentage <
                            lowest.load_percentage
                        ) {

                            return centre;

                        }

                        return lowest;

                    },
                    centres[0]
                );


            let message;


            if (
                overloaded.length > 0
            ) {

                message =
                    `${overloaded[0].name} is overloaded. ` +
                    `${recommended.name} has the lowest current load.`;

            } else {

                message =
                    "No centre is currently overloaded.";

            }


            res.json({

                success: true,

                centres,

                overloaded,

                recommended,

                message

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Load balancer failed",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// MOVE BOOKING
// ============================================================


// POST /api/bookings/:id/move
//
// Body:
//
// {
//     "new_centre_id": 2
// }

app.post(
    "/api/bookings/:id/move",
    async (req, res) => {

        try {

            const bookingId =
                Number(req.params.id);


            const {
                new_centre_id
            } = req.body;


            if (
                !Number.isInteger(
                    bookingId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid booking ID"

                });

            }


            const newCentreId =
                Number(new_centre_id);


            if (
                !Number.isInteger(
                    newCentreId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "new_centre_id must be a valid number"

                });

            }


            // ------------------------------------------------
            // Get booking.
            // ------------------------------------------------

            const bookingResult =
                await pool.query(

                    `SELECT *
                     FROM bookings
                     WHERE id = $1`,

                    [bookingId]

                );


            if (
                bookingResult.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        `Booking ${bookingId} not found`

                });

            }


            const booking =
                bookingResult.rows[0];


            // ------------------------------------------------
            // Get new centre.
            // ------------------------------------------------

            const centreResult =
                await pool.query(

                    `SELECT *
                     FROM centres
                     WHERE id = $1`,

                    [newCentreId]

                );


            if (
                centreResult.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        `Centre ${newCentreId} not found`

                });

            }


            const newCentre =
                centreResult.rows[0];


            // ------------------------------------------------
            // Prevent moving to same centre.
            // ------------------------------------------------

            if (
                Number(booking.centre_id) ===
                newCentreId
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Booking is already at this centre"

                });

            }


            // ------------------------------------------------
            // Check destination daily capacity.
            // ------------------------------------------------

            const countResult =
                await pool.query(

                    `SELECT
                        COUNT(*) AS count

                     FROM bookings

                     WHERE centre_id = $1

                     AND booking_date::date =
                         $2::date

                     AND status IN (
                         'BOOKED',
                         'CONFIRMED',
                         'ARRIVED',
                         'WAITING'
                     )`,

                    [
                        newCentreId,
                        booking.booking_date
                    ]

                );


            const destinationBookings =
                Number(
                    countResult.rows[0].count
                );


            if (
                destinationBookings >=
                Number(
                    newCentre.daily_capacity
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        `${newCentre.name} has reached daily capacity`

                });

            }


            // ------------------------------------------------
            // Find destination schedule.
            // ------------------------------------------------

            const schedule =
                await findSchedule(

                    newCentreId,

                    booking.booking_date,

                    booking.preferred_window ||
                        "MORNING",

                    Number(
                        booking.quantity
                    )

                );


            if (!schedule) {

                return res.status(400).json({

                    success: false,

                    message:
                        "No suitable slot available at the new centre"

                });

            }


            // ------------------------------------------------
            // Update booking.
            // ------------------------------------------------

            const updateResult =
                await pool.query(

                    `UPDATE bookings

                     SET

                        centre_id = $1,

                        preferred_window = $2,

                        token_no = $3,

                        estimated_duration = $4,

                        scheduled_time = $5,

                        window_capacity = $6,

                        grace_until = $7,

                        queue_position = $8

                     WHERE id = $9

                     RETURNING *`,

                    [

                        newCentreId,

                        schedule.window,

                        schedule.queuePosition,

                        schedule.duration,

                        schedule.scheduledTime,

                        WINDOWS[
                            schedule.window
                        ].capacity,

                        schedule.graceUntil,

                        schedule.queuePosition,

                        bookingId

                    ]

                );


            res.json({

                success: true,

                message:
                    `Booking moved to ${newCentre.name}`,

                booking:
                    updateResult.rows[0],

                scheduling: {

                    window:
                        schedule.window,

                    token:
                        schedule.queuePosition,

                    scheduled_time:
                        schedule.scheduledTime,

                    grace_until:
                        schedule.graceUntil

                }

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to move booking",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// BOOKING LOOKUP
// ============================================================


// GET /api/bookings/:bookingId
//
// Example:
//
// /api/bookings/SP-123456

app.get(
    "/api/bookings/:bookingId",
    async (req, res) => {

        try {

            const bookingId =
                req.params.bookingId;


            const result =
                await pool.query(

                    `SELECT

                        b.*,

                        f.farmer_id
                            AS public_farmer_id,

                        f.name
                            AS farmer_name,

                        c.name
                            AS centre_name

                     FROM bookings b

                     JOIN farmers f
                        ON b.farmer_id = f.id

                     JOIN centres c
                        ON b.centre_id = c.id

                     WHERE b.booking_id = $1`,

                    [bookingId]

                );


            if (
                result.rows.length === 0
            ) {

                return res.status(404).json({

                    success: false,

                    message:
                        `Booking ${bookingId} not found`

                });

            }


            res.json({

                success: true,

                booking:
                    result.rows[0]

            });

        } catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch booking",

                error:
                    error.message

            });

        }

    }
);


// ============================================================
// SERVER START
// ============================================================

const PORT =
    process.env.PORT || 5000;


app.listen(
    PORT,
    () => {

        console.log(
            `SmartProcure server running on port ${PORT}`
        );

        console.log(
            `Server URL: http://localhost:${PORT}`
        );

        console.log(
            `DB test: http://localhost:${PORT}/api/test-db`
        );

        console.log(
            `Farmers: http://localhost:${PORT}/api/farmers`
        );

        console.log(
            `Centres: http://localhost:${PORT}/api/centres`
        );

    }
);