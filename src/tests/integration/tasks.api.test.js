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

//Ejercicio 2.4: Actualización del estado done
test("PUT /tasks/:id actualiza el estado en la base de datos", async () => {
    // Primero creamos la tarea que vamos a actualizar.
    const creada = await request(app)
        .post("/tasks")
        .send({ title: "Lavar el auto" });

    const res = await request(app)
        .put(`/tasks/${creada.body.id}`)
        .send({ done: true });

    expect(res.status).toBe(200);
    expect(res.body.done).toBe(true);

    const { rows } = await pool.query(
        "SELECT done FROM tasks WHERE id = $1",
        [creada.body.id]
    );
    expect(rows[0].done).toBe(true);
});

//Ejercicio 2.5: Eliminación efectiva de la fila
test("DELETE /tasks/:id elimina la fila de la base de datos", async () => {
    const creada = await request(app)
        .post("/tasks")
        .send({ title: "Tarea temporal" });

    const res = await request(app).delete(`/tasks/${creada.body.id}`);
    expect(res.status).toBe(204);

    const { rows } = await pool.query(
        "SELECT * FROM tasks WHERE id = $1",
        [creada.body.id]
    );
    expect(rows).toHaveLength(0);
});

//Ejercicio 2.6 (propuesto): Independencia entre pruebas -- Medición de Performance Nativa (Performance API)

//Ejercicio 2.7 (propuesto): Verificación del listado
test("GET /tasks devuelve exactamente tres elementos ordenados por id ascendente", async () => {
    // 1. Insertar tres tareas mediante POST /tasks secuencialmente
    await request(app).post("/tasks").send({ title: "Primera tarea" });
    await request(app).post("/tasks").send({ title: "Segunda tarea" });
    await request(app).post("/tasks").send({ title: "Tercera tarea" });

    // 2. Solicitar el listado completo mediante GET /tasks
    const res = await request(app).get("/tasks");

    // 3. Verificar el estado HTTP
    expect(res.status).toBe(200);

    // 4. Verificar que se devuelven exactamente tres elementos
    expect(res.body).toHaveLength(3);

    // 5. Verificar que estén ordenados por id de forma ascendente
    expect(res.body[0].title).toBe("Primera tarea");
    expect(res.body[1].title).toBe("Segunda tarea");
    expect(res.body[2].title).toBe("Tercera tarea");
    
    // Verificación matemática explícita de los IDs correlativos
    expect(res.body[0].id).toBeLessThan(res.body[1].id);
    expect(res.body[1].id).toBeLessThan(res.body[2].id);
});