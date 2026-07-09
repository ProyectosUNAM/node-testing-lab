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

//Ejercicio 2.2: La validación impide la escritura
test("responde 400 si falta el titulo y no inserta nada", async () => {
    const res = await request(app).post("/tasks").send({});

    expect(res.status).toBe(400);

    // Confirmamos contra la BD real que NO se inserto ninguna fila.
    const { rows } = await pool.query("SELECT * FROM tasks");
    expect(rows).toHaveLength(0);
});

//Ejercicio 2.3: Recurso inexistente devuelve 404
test("GET /tasks/:id devuelve 404 si la tarea no existe", async () => {
    const res = await request(app).get("/tasks/9999");
    expect(res.status).toBe(404);
});