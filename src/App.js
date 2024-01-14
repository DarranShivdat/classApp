//tech used so far

//Python, JS, node.js, google cloud, vertex vision ai, tensorflow

// App.js
import IMAGENET_CLASSES from './imagenet_classes';
import React, { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import { fetchBMWImages } from './unsplashService';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [query, setQuery] = useState('');
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState({});

  // Function to load the TensorFlow.js model
  const loadModel = async () => {
    try {
      const loadedModel = await tf.loadGraphModel('/models/model.json');
      setModel(loadedModel);
      console.log('Model loaded successfully');
    } catch (error) {
      console.error('Error loading model', error);
    }
  };

  // Load the model when the component mounts
  useEffect(() => {
    loadModel();
  }, []);

  // Function to fetch images from Unsplash
  const fetchImages = async (searchQuery) => {
    const imagesFromUnsplash = await fetchBMWImages(searchQuery);
    setImages(imagesFromUnsplash);
    // Reset predictions when fetching new images
    setPredictions({});
  };

  // Function to preprocess the image and make a prediction
  const classifyImage = async (imageSrc) => {
    if (!model) {
      console.error('Model not loaded yet');
      return;
    }

    // Preprocess the image
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.src = imageSrc;
    await new Promise((resolve) => {
      image.onload = () => resolve();
    });
    
    const tensor = tf.browser.fromPixels(image)
      .resizeNearestNeighbor([224, 224]) // Example size for ResNet, adjust if needed
      .toFloat()
      .div(tf.scalar(255)) // Normalize pixel values
      .expandDims();

    // Make a prediction
    const prediction = model.predict(tensor);

    // Convert prediction to readable format
    const predictedClassIndex = tf.argMax(prediction, 1).dataSync()[0];

    // Dispose the tensor to release memory
    tensor.dispose();

    // Use the IMAGENET_CLASSES array to get the predicted label
    const predictedClassLabel = IMAGENET_CLASSES[predictedClassIndex];

    return predictedClassLabel; // Return the actual label
};



  // Function to handle image classification for each image
  const handleClassifyImages = async () => {
    const newPredictions = {};
    for (const image of images) {
      const prediction = await classifyImage(image.urls.regular);
      newPredictions[image.id] = prediction; // Store predictions by image id
    }
    setPredictions(newPredictions);
  };

  // Trigger classification when images are updated
  useEffect(() => {
    if (images.length > 0 && model) {
      handleClassifyImages();
    }
  }, [images, model]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type a model, e.g., 'M4'"
      />
      <button onClick={() => fetchImages(query)}>Search</button>

      <div className="image-container">
        {images.map((image) => (
          <div key={image.id} className="image-prediction-container">
            <img
              src={image.urls.regular}
              alt={image.alt_description}
              className="resize-image"
            />
            <p className="prediction-text">
              {predictions[image.id] ? `Classified as: ${predictions[image.id]}` : 'Classifying...'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
