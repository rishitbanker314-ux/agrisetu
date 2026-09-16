import { Client } from "@gradio/client";

async function test() {
    try {
        const client = await Client.connect("rishit0311/agricrate-api");
        console.log("Connected");
        
        // Let's get the API info
        const info = await client.view_api();
        console.log(JSON.stringify(info, null, 2));

        // Create a dummy 1px black png blob
        const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
        const bytes = new Uint8Array(atob(base64).split("").map(c => c.charCodeAt(0)));
        const blob = new Blob([bytes], { type: "image/png" });

        console.log("Predicting...");
        const result = await client.predict("/predict_disease", [blob]);
        console.log("Result:", result);
    } catch (e) {
        console.error(e);
    }
}
test();
