const request = require("supertest");
const { Pool } = require("pg");
const { createApp } = require("../../../src/app");

const TEST_DATABASE_URL =
    process.env.TEST_DATABASE_URL ||
    "postgres://labuser:labpass@localhost:5433/tasksdb_test";

let pool;
let app;

// Se ejecuta UNA vez, antes de todas las pruebas del archivo.
beforeAll(() => {
    pool = new Pool({ connectionString: TEST_DATABASE_URL });
    app = createApp(pool);
});

// Se ejecuta UNA vez, al terminar todas las pruebas.
afterAll(async () => {
    await pool.end(); // cierra la conexion para que Jest finalice limpio
});

// Se ejecuta ANTES DE CADA prueba individual.
beforeEach(async () => {
    // Cada prueba debe ser independiente de las demas.
    await pool.query("TRUNCATE TABLE tasks RESTART IDENTITY");
});

//Ejercicio 2.1: Persistencia efectiva de una tarea ---- ACTIVIDAD 8: PRIORIDAD
describe("POST /tasks (integracion con PostgreSQL real)", () => {

    test("guarda la prioridad en la base de datos", async () => {
    const res = await request(app)
        .post("/tasks")
        .send({ title: "Urgente", priority: "alta" });

    expect(res.body.priority).toBe("alta");

    const { rows } = await pool.query(
        "SELECT priority FROM tasks WHERE id = $1",
        [res.body.id]
    );

    expect(rows[0].priority).toBe("alta");
    });
});