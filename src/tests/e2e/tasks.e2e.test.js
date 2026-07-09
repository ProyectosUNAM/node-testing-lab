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