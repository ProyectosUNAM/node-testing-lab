const { createTask } = require("../../../src/services/tasks.service");

describe("createTask (prueba unitaria)", () => {

//Ejercicio 1.1: Creación exitosa de una tarea
    test("crea la tarea cuando el titulo es valido", async () => {
        // 1. PREPARAR (Arrange): construimos un pool falso.
        // jest.fn() crea una funcion espia que registra sus llamadas.
        // mockResolvedValue programa la respuesta simulada de la BD.
        const fakePool = {
            query: jest.fn().mockResolvedValue({
                rows: [{ id: 1, title: "Estudiar", done: false }],
            }),
        };

        // 2. ACTUAR (Act): invocamos la unidad bajo prueba.
        const result = await createTask(
            fakePool,
            { title: "Estudiar" }
        );
        // 3. VERIFICAR (Assert): comprobamos el resultado
        // y la interaccion con la dependencia.
        expect(result.id).toBe(1);
        expect(result.title).toBe("Estudiar");
        expect(fakePool.query).toHaveBeenCalledTimes(1);
    });

    //Ejercicio 1.2: Validación de título vacío

    test("rechaza la tarea si el titulo esta vacio", async () => {

        // Pool falso sin respuesta programada: si el servicio lo llamara,
        // seria un defecto de diseno (no debe tocar la BD con datos invalidos).
        const fakePool = { query: jest.fn() };

        // Esperamos que la promesa sea RECHAZADA (que lance un error).
        await expect(
            createTask(fakePool, { title: " " })
        ).rejects.toThrow("El titulo es obligatorio");

        // Verificamos que NUNCA se intento consultar la base de datos:
        // la validacion detuvo la operacion antes.
        expect(fakePool.query).not.toHaveBeenCalled();
    });

    //Ejercicio 1.3: Normalización del título (trim) ---- ACTIVIDAD 8: PRIORIDAD

    test("crea la tarea con la prioridad indicada", async () => {
        const fakePool = {
            query: jest.fn().mockResolvedValue({
                rows: [{ id: 1, title: "Estudiar", priority: "alta" }],
            }),
        };

        const result = await createTask(
            fakePool,
            { title: "Estudiar", priority: "alta" }
        );

        expect(result.priority).toBe("alta");
    });

    //Ejercicio 1.4: Recurso inexistente devuelve null

    const { getTaskById,
    } = require("../../../src/services/tasks.service");

    test("getTaskById devuelve null cuando no hay resultados", async () => {
        // Simulamos que la BD no devolvio ninguna fila.
        const fakePool = {
            query: jest.fn().mockResolvedValue({ rows: [] }),
        };

        const result = await getTaskById(fakePool, 999);

        expect(result).toBeNull();
    });

    //Ejercicio 1.5 (propuesto): Rechazo de tipos inválidos

    test("rechaza la tarea si el titulo no es una cadena de texto (ej. 42 o null)", async () => {
        // Pool falso sin respuesta programada: no debe tocar la BD si el tipo es inválido
        const fakePool = { query: jest.fn() };

        // 1. Probar con un número (42)
        await expect(
            createTask(fakePool, { title: 42 })
        ).rejects.toThrow(); // Puedes poner el mensaje exacto si tu validación lo tiene

        // 2. Probar con un valor null
        await expect(
            createTask(fakePool, { title: null })
        ).rejects.toThrow();

        // Verificamos que NUNCA se intentó consultar la base de datos
        expect(fakePool.query).not.toHaveBeenCalled();
    });

            // Ejercicio 1.6 (propuesto): Simulación de un fallo de la base de datos
    const { listTasks } = require("../../../src/services/tasks.service");
    
    test("listTasks propaga el error si la base de datos falla", async () => {
        // Simulamos que PostgreSQL devuelve un error de conexión
        const fakePool = {
            query: jest.fn().mockRejectedValue(
                new Error("connection refused")
            ),
        };

        // Esperamos que la función listTasks propague (lance) el error simulado
        await expect(
            listTasks(fakePool)
        ).rejects.toThrow("connection refused");

        // Opcional: Verificar que al menos se intentó hacer la consulta
        expect(fakePool.query).toHaveBeenCalled();
    });

});