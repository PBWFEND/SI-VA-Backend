
console.log("=== AKTIVITAS 2: PREDIKSI OUTPUT ===");

console.log("A");

setTimeout(() => {
    console.log("B");
}, 0);

Promise.resolve().then(() => {
    console.log("C");
});

console.log("D");

setTimeout(() => {
    console.log("E");
}, 100);
