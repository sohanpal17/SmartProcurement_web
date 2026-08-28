const pool = require("./db");

async function seedDemo() {
    try {
        console.log("Creating demo data...");

        // Clear existing demo bookings/farmers
        await pool.query("DELETE FROM bookings");
        await pool.query("DELETE FROM farmers");

        const centres = await pool.query(
            "SELECT id, name FROM centres ORDER BY id"
        );

        const centreIds = centres.rows.map(c => c.id);

        console.log("Centres:", centres.rows);

        let farmerNumber = 1000;

        async function createBooking(centreId, tokenNo, status = "WAITING") {

            farmerNumber++;

            const farmerResult = await pool.query(
                `INSERT INTO farmers
                (farmer_id, name, mobile)
                VALUES ($1, $2, $3)
                RETURNING id`,
                [
                    `FMR-${farmerNumber}`,
                    `Demo Farmer ${farmerNumber}`,
                    `900000${farmerNumber}`
                ]
            );

            const farmerId = farmerResult.rows[0].id;

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
                    status
                )
                VALUES
                ($1,$2,$3,$4,$5,CURRENT_DATE,$6,$7,$8,$9)`,
                [
                    `DEMO-${centreId}-${tokenNo}`,
                    farmerId,
                    centreId,
                    "Soybean",
                    20,
                    "MORNING",
                    tokenNo,
                    20,
                    status
                ]
            );
        }

        // Vashi = 36 bookings
        for (let i = 1; i <= 36; i++) {
            await createBooking(
                centreIds[0],
                i,
                i === 1 ? "ARRIVED" : "WAITING"
            );
        }

        // Turbhe = 20 bookings
        for (let i = 1; i <= 20; i++) {
            await createBooking(
                centreIds[1],
                i,
                "WAITING"
            );
        }

        // Sanpada = 24 bookings
        for (let i = 1; i <= 24; i++) {
            await createBooking(
                centreIds[2],
                i,
                "WAITING"
            );
        }

        console.log("Demo data created successfully!");

        await pool.end();

    } catch (error) {
        console.error("Seed failed:", error);
        await pool.end();
    }
}

seedDemo();
