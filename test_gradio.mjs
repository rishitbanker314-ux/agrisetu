import { Client } from "@gradio/client";
import fs from "fs";

async function run() {
    const client = await Client.connect("rishit0311/agricrate-api");
    
    // Create a dummy 1x1 png image
    const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([new Uint8Array(buffer)]);

    const result = await client.predict("/predict_disease", {
        image: blob,
    });
    console.dir(result, {depth: null});
}
run().catch(console.error);
