const express = require("express");
const Task = require("../models/Task");
const authMiddleware = require("../middleware/auth");

const router = express.Router();


// =========================
// CREATE TASK
// =========================

router.post("/", authMiddleware, async (req, res) => {
    try {

        const {
            title,
            description,
            priority,
            status,
            dueDate
        } = req.body;

        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Task title is required."
            });
        }

        const task = await Task.create({
            title,
            description: description || "",
            priority: priority || "Medium",
            status: status || "Pending",
            dueDate: dueDate || null,
            user: req.user.id
        });

        res.status(201).json({
            success: true,
            message: "Task created successfully!",
            task
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
});


// =========================
// GET ALL TASKS
// =========================

router.get("/", authMiddleware, async (req, res) => {
    try {

        const tasks = await Task.find({
            user: req.user.id
        }).sort({
            createdAt: -1
        });

        res.json({
            success: true,
            tasks
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
});


// =========================
// UPDATE TASK
// =========================

router.put("/:id", authMiddleware, async (req, res) => {
    try {

        const updates = {};

        // Only update fields that are actually provided

        if (req.body.title !== undefined) {
            updates.title = req.body.title;
        }

        if (req.body.description !== undefined) {
            updates.description = req.body.description;
        }

        if (req.body.priority !== undefined) {
            updates.priority = req.body.priority;
        }

        if (req.body.status !== undefined) {
            updates.status = req.body.status;
        }

        if (req.body.dueDate !== undefined) {
            updates.dueDate = req.body.dueDate || null;
        }


        const task = await Task.findOneAndUpdate(
            {
                _id: req.params.id,
                user: req.user.id
            },
            {
                $set: updates
            },
            {
                new: true,
                runValidators: true
            }
        );


        if (!task) {

            return res.status(404).json({
                success: false,
                message: "Task not found."
            });

        }


        res.json({
            success: true,
            message: "Task updated successfully!",
            task
        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
});


// =========================
// DELETE TASK
// =========================

router.delete("/:id", authMiddleware, async (req, res) => {
    try {

        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id
        });


        if (!task) {

            return res.status(404).json({
                success: false,
                message: "Task not found."
            });

        }


        res.json({
            success: true,
            message: "Task deleted successfully!"
        });


    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
});


module.exports = router;