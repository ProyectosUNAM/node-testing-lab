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


});