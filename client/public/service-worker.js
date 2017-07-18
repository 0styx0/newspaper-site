const cache = "sw-cache-0";

self.addEventListener("install", e => {
    console.log("Installing");

    e.waitUntil(precache());
});