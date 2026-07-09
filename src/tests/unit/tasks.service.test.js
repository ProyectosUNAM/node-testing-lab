const { performance } = require('perf_hooks'); // Importamos la API de Performance de Node.js

const { createTask } = require("../../../src/services/tasks.service");

describe("createTask (prueba unitaria)", () => {



    // Medición de Performance Nativa (Performance API): 
    let startTime; 
    beforeAll(() => {
        startTime = performance.now(); 
    });
    afterAll(() => {
        const endTime = performance.now();
        const duration = (endTime - startTime) / 1000; // Pasado a segundos
        console.log(`\n⏱️  [MEDICIÓN PURA] Tiempo neto de los tests: ${duration.toFixed(4)} s\n`);
    });

});