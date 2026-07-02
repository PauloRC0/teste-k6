import db from "./database.js";

db.exec(`
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    price REAL
);
`);

const insert = db.prepare(`
INSERT INTO products (name, category, price)
VALUES (?, ?, ?)
`);

const total = 10000;

const insertMany = db.transaction(() => {

    for (let i = 1; i <= total; i++) {

        insert.run(
            `Produto ${i}`,
            `Categoria ${i % 10}`,
            Math.random() * 1000
        );

        if (i % 1000 === 0) {
            console.log(`${i} produtos inseridos...`);
        }
    }

});

insertMany();

console.log("Inserção concluída.");