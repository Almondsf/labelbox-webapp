import React, { useState, useEffect } from "react";
import Annotation from "react-image-annotation";
import { getImages, saveAnnotation } from "../services/api";

const AnnotationTool = () => {
  const [images, setImages] = useState([]); // Stores all fetched images
  const [imageIndex, setImageIndex] = useState(0); // Tracks the current image index
  const [annotations, setAnnotations] = useState({}); // Store annotations for each image (keyed by image ID)
  const [annotation, setAnnotation] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // To display error messages

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const data = await getImages();
        setImages(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching images:", error);
        setError("Failed to load images.");
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  const currentImage = images[imageIndex];

  const handleSaveAnnotation = async () => {
    if (!currentImage) return;

    const currentAnnotations = annotations[currentImage.id] || [];
    if (currentAnnotations.length === 0) {
      alert("No annotations to save.");
      return;
    }

    try {
      for (const ann of currentAnnotations) {
        const payload = {
          image: currentImage.id,
          label: ann.data.text,
          x: parseFloat(ann.geometry.x),
          y: parseFloat(ann.geometry.y),
          width: parseFloat(ann.geometry.width),
          height: parseFloat(ann.geometry.height),
        };

        console.log("Sending payload:", payload); // Debug: See exactly what's sent
        await saveAnnotation(payload);
      }

      alert("All annotations saved successfully");
    } catch (error) {
      console.error("Error saving annotation:", error);
      if (error.response && error.response.data) {
        console.error("Server Response:", error.response.data); // Show backend error
      }
      alert("Failed to save annotations. Please try again.");
    }
  };

  const onChange = (newAnnotation) => setAnnotation(newAnnotation);

  const onSubmit = (newAnnotation) => {
    const { geometry, data } = newAnnotation;
    const newAnnotationData = {
      geometry,
      data: {
        ...data,
        id: Math.random(),
      },
    };

    setAnnotations((prev) => ({
      ...prev,
      [currentImage.id]: [...(prev[currentImage.id] || []), newAnnotationData],
    }));
  };

  const handleNextImage = () => {
    if (imageIndex < images.length - 1) setImageIndex(imageIndex + 1);
  };

  const handlePreviousImage = () => {
    if (imageIndex > 0) setImageIndex(imageIndex - 1);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Image Annotation Tool</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {currentImage && (
        <Annotation
          src={currentImage.image_url}
          alt="Annotate this image"
          annotations={annotations[currentImage.id] || []}
          value={annotation}
          type={annotation.type}
          onChange={onChange}
          onSubmit={onSubmit}
          allowTouch
        />
      )}
      <button onClick={handlePreviousImage} disabled={imageIndex === 0}>
        Previous
      </button>
      <button
        onClick={handleNextImage}
        disabled={imageIndex === images.length - 1}
      >
        Next
      </button>
      <button onClick={handleSaveAnnotation}>Save Annotations</button>
    </div>
  );
};

export default AnnotationTool;
