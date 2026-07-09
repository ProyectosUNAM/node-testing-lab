//Ejercicio 3.1: Verificación de disponibilidad

// Dentro del contenedor "app", BASE_URL ya viene definida por
// Compose. El valor de respaldo sirve para ejecucion local.
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

test("el servicio responde en /health", async () => {
    const res = await fetch(`${BASE_URL}/health`);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe("ok");
});

//Ejercicio 3.2: Flujo completo del ciclo de vida de una tarea
describe("Flujo completo de una tarea (E2E)", () => {

    test("crear -> consultar -> completar -> eliminar", async () => {

        // ---- PASO 1: CREAR (Modificado en el flujo E2E) ---- ACTIVIDAD 8: PRIORIDAD
        const resCrear = await fetch(`${BASE_URL}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: "Preparar la practica",
                priority: "alta",
            }),
        });

        const tarea = await resCrear.json();
        expect(tarea.priority).toBe("alta");

        // ---- PASO 2: CONSULTAR ----
        const id = tarea.id;

        const resConsultar = await fetch(`${BASE_URL}/tasks/${id}`);
        expect(resConsultar.status).toBe(200);

        const consultada = await resConsultar.json();
        expect(consultada.done).toBe(false);

        // ---- PASO 3: COMPLETAR ----
        const resCompletar = await fetch(`${BASE_URL}/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ done: true }),
        });
        expect(resCompletar.status).toBe(200);

        const completada = await resCompletar.json();
        expect(completada.done).toBe(true);

        // ---- PASO 4: ELIMINAR ----
        const resEliminar = await fetch(`${BASE_URL}/tasks/${id}`, {
            method: "DELETE",
        });
        expect(resEliminar.status).toBe(204);

        // ---- PASO 5: CONFIRMAR QUE YA NO EXISTE ----
        const resFinal = await fetch(`${BASE_URL}/tasks/${id}`);
        expect(resFinal.status).toBe(404);
    });
});

//Ejercicio 3.3 (propuesto): Rechazo de datos inválidos de extremo a extremo
test("POST /tasks con cuerpo vacío responde 400 Bad Request", async () => {
    const res = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}), // Enviamos un cuerpo vacío inválido
    });

    expect(res.status).toBe(400);
});

//Ejercicio 3.4 (propuesto): Idempotencia del borrado
test("DELETE /tasks/:id responde 204 en el primer borrado y 404 en el segundo", async () => {
    // 1. Crear la tarea de prueba
    const resCrear = await fetch(`${BASE_URL}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Tarea para borrar dos veces" }),
    });
    const tarea = await resCrear.json();
    const id = tarea.id;

    // 2. Primer borrado (Debe responder 204 ya que el recurso existe)
    const resBorrar1 = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: "DELETE",
    });
    expect(resBorrar1.status).toBe(204);

    // 3. Segundo borrado (Debe responder 404 ya que el recurso fue eliminado previamente)
    const resBorrar2 = await fetch(`${BASE_URL}/tasks/${id}`, {
        method: "DELETE",
    });
    expect(resBorrar2.status).toBe(404);
});