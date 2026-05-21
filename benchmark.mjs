async function simulateHandleConfirmItem(id) {
    // Simulate some async work like updating state or API calls (e.g. 50ms)
    await new Promise(resolve => setTimeout(resolve, 50));
}

const items = Array.from({ length: 20 }, (_, i) => ({ id: `item-${i}` }));

async function runSequential() {
    const start = performance.now();
    for (const item of items) {
        await simulateHandleConfirmItem(item.id);
    }
    const end = performance.now();
    console.log(`Sequential execution time: ${(end - start).toFixed(2)} ms`);
}

async function runParallel() {
    const start = performance.now();
    await Promise.all(items.map(item => simulateHandleConfirmItem(item.id)));
    const end = performance.now();
    console.log(`Parallel execution time: ${(end - start).toFixed(2)} ms`);
}

async function run() {
    console.log(`Simulating processing ${items.length} items...`);
    await runSequential();
    await runParallel();
}

run();
