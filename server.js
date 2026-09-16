const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const db = require("./database");

const app = express();
const PORT = 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        error: "Too many requests. Please try again later."
    }
});

app.use("/api", limiter);

// Home route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Internship API is running"
    });
});

// GET - List internships with pagination
app.get("/api/internships", (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page) || 1, 1);
        const limit = Math.min(
            Math.max(parseInt(req.query.limit) || 10, 1),
            50
        );

        const offset = (page - 1) * limit;

        const total = db
            .prepare("SELECT COUNT(*) AS count FROM internships")
            .get().count;

        const internships = db
            .prepare(`
                SELECT *
                FROM internships
                ORDER BY id DESC
                LIMIT ? OFFSET ?
            `)
            .all(limit, offset);

        res.status(200).json({
            success: true,
            data: internships,
            pagination: {
                page: page,
                limit: limit,
                total: total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to fetch internships"
        });
    }
});

// GET - Single internship
app.get("/api/internships/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid internship ID"
            });
        }

        const internship = db
            .prepare("SELECT * FROM internships WHERE id = ?")
            .get(id);

        if (!internship) {
            return res.status(404).json({
                success: false,
                error: "Internship not found"
            });
        }

        res.status(200).json({
            success: true,
            data: internship
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to fetch internship"
        });
    }
});

// POST - Create internship
app.post("/api/internships", (req, res) => {
    try {
        const {
            company_name,
            role,
            location,
            stipend,
            duration,
            description
        } = req.body;

        if (!company_name || !role || !location || !duration) {
            return res.status(400).json({
                success: false,
                error: "company_name, role, location and duration are required"
            });
        }

        if (
            stipend !== undefined &&
            (!Number.isInteger(stipend) || stipend < 0)
        ) {
            return res.status(400).json({
                success: false,
                error: "stipend must be a non-negative integer"
            });
        }

        const result = db
            .prepare(`
                INSERT INTO internships
                (
                    company_name,
                    role,
                    location,
                    stipend,
                    duration,
                    description
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `)
            .run(
                company_name.trim(),
                role.trim(),
                location.trim(),
                stipend || 0,
                duration.trim(),
                description ? description.trim() : null
            );

        const internship = db
            .prepare("SELECT * FROM internships WHERE id = ?")
            .get(result.lastInsertRowid);

        res.status(201).json({
            success: true,
            message: "Internship created successfully",
            data: internship
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to create internship"
        });
    }
});

// PUT - Update internship
app.put("/api/internships/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid internship ID"
            });
        }

        const existing = db
            .prepare("SELECT * FROM internships WHERE id = ?")
            .get(id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: "Internship not found"
            });
        }

        const {
            company_name,
            role,
            location,
            stipend,
            duration,
            description
        } = req.body;

        if (!company_name || !role || !location || !duration) {
            return res.status(400).json({
                success: false,
                error: "company_name, role, location and duration are required"
            });
        }

        if (
            stipend !== undefined &&
            (!Number.isInteger(stipend) || stipend < 0)
        ) {
            return res.status(400).json({
                success: false,
                error: "stipend must be a non-negative integer"
            });
        }

        db.prepare(`
            UPDATE internships
            SET
                company_name = ?,
                role = ?,
                location = ?,
                stipend = ?,
                duration = ?,
                description = ?
            WHERE id = ?
        `).run(
            company_name.trim(),
            role.trim(),
            location.trim(),
            stipend || 0,
            duration.trim(),
            description ? description.trim() : null,
            id
        );

        const updatedInternship = db
            .prepare("SELECT * FROM internships WHERE id = ?")
            .get(id);

        res.status(200).json({
            success: true,
            message: "Internship updated successfully",
            data: updatedInternship
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to update internship"
        });
    }
});

// DELETE - Delete internship
app.delete("/api/internships/:id", (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                success: false,
                error: "Invalid internship ID"
            });
        }

        const existing = db
            .prepare("SELECT * FROM internships WHERE id = ?")
            .get(id);

        if (!existing) {
            return res.status(404).json({
                success: false,
                error: "Internship not found"
            });
        }

        db.prepare("DELETE FROM internships WHERE id = ?").run(id);

        res.status(200).json({
            success: true,
            message: "Internship deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to delete internship"
        });
    }
});

// 404 route
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: "Route not found"
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Internship API running at http://localhost:${PORT}`);
});