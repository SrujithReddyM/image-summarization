// DOM Elements
const imageUploadInput = document.getElementById("image-upload");
const uploadSection = document.getElementById("upload-section");
const previewSection = document.getElementById("preview-section");
const resultSection = document.getElementById("result-section");
const imagePreview = document.getElementById("image-preview");
const summarizeBtn = document.getElementById("summarize-btn");
const restartBtn = document.getElementById("restart-btn");
const summaryText = document.getElementById("summary-text");

// Handle Image Upload
imageUploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview.src = reader.result; // Set preview image
      uploadSection.classList.add("hidden");
      previewSection.classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
});

// Generate Summary Using Hugging Face API
const spinner = document.getElementById("spinner"); // Reference the spinner

summarizeBtn.addEventListener("click", async () => {
  // Ensure an image is uploaded
  const file = imageUploadInput.files[0];
  if (!file) {
    alert("Please upload an image first.");
    return;
  }

  // Validate file type
  const validImageTypes = ["image/jpeg", "image/png", "image/jpg"];
  if (!validImageTypes.includes(file.type)) {
    alert("Unsupported file format. Please upload a JPG or PNG image.");
    return;
  }

  // Show spinner and hide summary text
  spinner.classList.remove("hidden");
  summaryText.textContent = "";

  try {
    // Read the image file as binary data
    const imageData = await file.arrayBuffer();

    // Make the API request
    const response = await fetch(
      "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-base",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer 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", // Replace with your actual API key
          "Content-Type": "application/octet-stream", // Tell API we're sending binary data
        },
        body: imageData, // Send binary image data
      }
    );

    // Parse the response
    if (response.ok) {
      const data = await response.json();
      summaryText.textContent =
        data[0]?.generated_text || "No summary available.";
    } else {
      const errorData = await response.json();
      // Handle specific API errors
      if (errorData.error?.includes("rate limit")) {
        summaryText.textContent =
          "Error: Rate limit exceeded. Please try again later.";
      } else {
        summaryText.textContent = `Error: ${
          errorData.error || "Failed to fetch summary."
        }`;
      }
    }
  } catch (error) {
    console.error("API request failed:", error);
    // Network or unexpected errors
    summaryText.textContent =
      "An error occurred while processing your request. Please check your connection and try again.";
  } finally {
    summarizeBtn.disabled = false;
    spinner.classList.add("hidden"); // Hide spinner when done
    previewSection.classList.add("hidden");
    resultSection.classList.remove("hidden");
  }
});

// Restart Process
restartBtn.addEventListener("click", () => {
  imageUploadInput.value = ""; // Clear input
  resultSection.classList.add("hidden");
  uploadSection.classList.remove("hidden");
});
