let model, webcam, labelContainer, maxPredictions;

// Load the Teachable Machine model
async function loadModel() {
    const modelURL = 'https://teachablemachine.withgoogle.com/models/V-NjYqtNy/model.json';
    const metadataURL = 'https://teachablemachine.withgoogle.com/models/V-NjYqtNy/metadata.json';
    

    try {
        console.log("Loading model...");
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("Model loaded successfully!");
    } catch (error) {
        console.error("Error loading model:", error); // Log detailed error
        alert(`Error loading model: ${error.message}`);
    }
}


// Setup the webcam
async function setupWebcam() {
    try {
        webcam = new tmImage.Webcam(300, 300, true); // width, height, flip horizontally
        await webcam.setup(); // Request webcam access
        await webcam.play(); // Start the webcam feed

        // Attach the webcam's canvas to the DOM
        const videoContainer = document.getElementById('webcam-container'); // Changed ID to 'webcam-container'
        videoContainer.innerHTML = ""; // Clear any existing content
        videoContainer.appendChild(webcam.canvas); // Add the webcam canvas

        labelContainer = document.getElementById('result-text');
        window.requestAnimationFrame(loop); // Start the update loop
    } catch (error) {
        console.error("Error setting up webcam:", error);
        alert("Error accessing the webcam. Please check permissions.");
    }
}

// Main update loop for webcam feed and predictions
async function loop() {
    webcam.update(); // Update the webcam feed
    await predict(); // Run predictions on the current frame
    window.requestAnimationFrame(loop); // Continue looping
}

// Predict the class of the current webcam frame
async function predict() {
    if (!model) {
        labelContainer.innerText = "Model not loaded yet.";
        return;
    }

    const predictions = await model.predict(webcam.canvas);

    // Find the highest confidence prediction
    const highestPrediction = predictions.reduce((prev, current) =>
        prev.probability > current.probability ? prev : current
    );

    // Display the result
    labelContainer.innerText = `This looks like a: ${highestPrediction.className} (Confidence: ${(highestPrediction.probability * 100).toFixed(2)}%)`;
}

// Start scanning when the button is clicked
document.getElementById('start-scan').addEventListener('click', async () => {
    await loadModel(); // Load the model first
    await setupWebcam(); // Initialize the webcam
});
