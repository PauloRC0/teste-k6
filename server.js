import express from "express";
import db from "./database.js";

const app = express();

app.use(express.json());

let totalRequests = 0;

// =======================================
// Endpoint rápido
// =======================================

app.get("/fast", (req, res) => {
    totalRequests++;

    res.json({
        endpoint: "fast",
        message: "Resposta imediata",
        totalRequests
    });
});

// =======================================
// Lista de produtos
// =======================================

app.get("/products", (req, res) => {
    totalRequests++;

    try {

        const products = db
            .prepare("SELECT * FROM products LIMIT 20")
            .all();

        res.json({
            totalRequests,
            total: products.length,
            products
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
});

// =======================================
// Relatório (consulta pesada)
// =======================================

app.get("/report", (req, res) => {
    totalRequests++;

    const start = Date.now();

    try {

        const report = db.prepare(`
            SELECT
                category,
                COUNT(*) AS totalProducts,
                ROUND(AVG(price), 2) AS averagePrice,
                ROUND(MAX(price), 2) AS maxPrice,
                ROUND(MIN(price), 2) AS minPrice,
                ROUND(SUM(price), 2) AS totalValue
            FROM products
            GROUP BY category
            ORDER BY totalValue DESC
        `).all();

        const duration = Date.now() - start;

        res.json({
            endpoint: "report",
            generatedIn: `${duration} ms`,
            totalRequests,
            categories: report
        });

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }
});

// =======================================
// Estatísticas da API
// =======================================

app.get("/stats", (req, res) => {

    res.json({

        totalRequests,

        uptime: process.uptime(),

        memory: process.memoryUsage(),

        database: db
            .prepare("SELECT COUNT(*) AS total FROM products")
            .get()

    });

});

// =======================================

const PORT = 3001;

app.listen(PORT, 511, () => {

    console.log("--------------------------------");
    console.log("API iniciada");
    console.log(`http://localhost:${PORT}`);
    console.log("--------------------------------");

});