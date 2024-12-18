import React, { useState, useEffect } from "react";
import Annotation from "react-image-annotation";
import { getImages, saveAnnotation } from "../services/api";
import "./AnnotationTool.css"; // Import the CSS styles

const AnnotationTool = () => {
  const [images, setImages] = useState([]);
  const [imageIndex, setImageIndex] = useState(0);
  const [annotations, setAnnotations] = useState({});
  const [annotation, setAnnotation] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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

        console.log("Sending payload:", payload);
        await saveAnnotation(payload);
      }

      setSuccessMessage("All annotations saved successfully! ✅");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Error saving annotation:", error);
      if (error.response && error.response.data) {
        console.error("Server Response:", error.response.data);
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

    setSuccessMessage("Annotation submitted successfully! 🎉");
    setTimeout(() => setSuccessMessage(""), 5000);
  };

  const handleNextImage = () => {
    if (imageIndex < images.length - 1) setImageIndex(imageIndex + 1);
  };

  const handlePreviousImage = () => {
    if (imageIndex > 0) setImageIndex(imageIndex - 1);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="annotation-tool">
      <h2>Image Annotation Tool</h2>

      {error && <p className="error-message">{error}</p>}

      {/* Submission Message */}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <div className="annotation-container">
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
      </div>

      <div className="button-container">
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
    </div>
  );
};

export default AnnotationTool;
