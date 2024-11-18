interface Shape {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
  borderRadius: number;
}

let currentShape: Shape | null = null;
let selectedShape: Shape | null = null;
let isDrawing = false;
let interactionMode: 'none' | 'moving' | 'resizing' | 'rotating' = 'none';
let rotationAngle = 0;
let offsetX = 0;
let offsetY = 0;
let resizingHandle: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null = null;

// Get the canvas and context
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas?.getContext("2d");

if (!canvas || !ctx) {
  throw new Error("Canvas or Canvas context is not available.");
}

const rotateButton = document.getElementById("rotate-button") as HTMLButtonElement | null;

rotateButton?.addEventListener("click", () => {
  if (selectedShape) {
    rotationAngle += 10; // Adjust the rotation increment as needed
    drawShape(selectedShape); // Redraw the shape with the updated rotation
  }
});


const shapeSelect = document.getElementById("shapeSelect") as HTMLSelectElement | null;
const colorPicker = document.getElementById("colorPicker") as HTMLInputElement | null;
const strokeWidthInput = document.getElementById("strokeWidthInput") as HTMLInputElement | null;
const borderRadiusInput = document.getElementById("borderRadiusInput") as HTMLInputElement | null;
const saveButton = document.getElementById("saveButton") as HTMLButtonElement | null;

// Set canvas size dynamically
canvas.width = 800;
canvas.height = 600;

// Helper function to draw resize handles
function drawResizeHandles(shape: Shape) {
  if (!ctx) return; // Ensure ctx is not null
  const handleSize = 10;
  ctx.fillStyle = "#000";

  // Draw each handle
  ctx.fillRect(shape.x - handleSize / 2, shape.y - handleSize / 2, handleSize, handleSize); // Top-left
  ctx.fillRect(shape.x + shape.width - handleSize / 2, shape.y - handleSize / 2, handleSize, handleSize); // Top-right
  ctx.fillRect(shape.x - handleSize / 2, shape.y + shape.height - handleSize / 2, handleSize, handleSize); // Bottom-left
  ctx.fillRect(shape.x + shape.width - handleSize / 2, shape.y + shape.height - handleSize / 2, handleSize, handleSize); // Bottom-right
}

// Helper function to draw the shape with rotation
function drawShape(shape: Shape) {
  if (!ctx) return; // Ensure ctx is not null

  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  ctx.save(); // Save the current context

  // Apply rotation to the context
  const centerX = shape.x + shape.width / 2;
  const centerY = shape.y + shape.height / 2;
  ctx.translate(centerX, centerY);
  ctx.rotate((rotationAngle * Math.PI) / 180);
  ctx.translate(-centerX, -centerY);

  ctx.fillStyle = shape.color;
  ctx.lineWidth = shape.strokeWidth;

  // Draw the shape based on selected option
  if (shapeSelect && shapeSelect.value === "rectangle") {
    ctx.beginPath();
    ctx.moveTo(shape.x + shape.borderRadius, shape.y); // top-left curve
    ctx.lineTo(shape.x + shape.width - shape.borderRadius, shape.y); // top-right line
    ctx.arcTo(
      shape.x + shape.width, shape.y, shape.x + shape.width, shape.y + shape.height, shape.borderRadius
    ); // top-right curve
    ctx.lineTo(shape.x + shape.width, shape.y + shape.height - shape.borderRadius); // bottom-right line
    ctx.arcTo(
      shape.x + shape.width, shape.y + shape.height, shape.x, shape.y + shape.height, shape.borderRadius
    ); // bottom-right curve
    ctx.lineTo(shape.x + shape.borderRadius, shape.y + shape.height); // bottom-left line
    ctx.arcTo(
      shape.x, shape.y + shape.height, shape.x, shape.y, shape.borderRadius
    ); // bottom-left curve
    ctx.lineTo(shape.x, shape.y + shape.borderRadius); // top-left line
    ctx.arcTo(
      shape.x, shape.y, shape.x + shape.width, shape.y, shape.borderRadius
    ); // top-left curve
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (shapeSelect && shapeSelect.value === "pentagon") {
    const centerX = shape.x + shape.width / 2; // Center of the pentagon
    const centerY = shape.y + shape.height / 2;
    const radius = Math.min(shape.width, shape.height) / 2; // Radius of the pentagon
    const sides = 5; // Number of sides for a pentagon
    const borderRadius = shape.borderRadius;
  
    ctx.beginPath();
  
    let previousX = 0;
    let previousY = 0;
  
    for (let i = 0; i <= sides; i++) {
      // Calculate the angle for each vertex
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
  
      if (i === 0) {
        // Move to the first vertex
        ctx.moveTo(x, y);
      } else {
        // Add rounded corners using arcTo
        ctx.arcTo(previousX, previousY, x, y, borderRadius);
      }
  
      previousX = x;
      previousY = y;
    }
  
    ctx.closePath(); // Close the shape
    ctx.fill();
    ctx.stroke();
  }

  else if (shapeSelect) {
    const centerX = shape.x + shape.width / 2; // Center of the shape
    const centerY = shape.y + shape.height / 2;
    const radius = Math.min(shape.width, shape.height) / 2; // Radius of the shape
    const borderRadius = shape.borderRadius; // Border radius
  
    let sides = 0;
  
    // Determine the number of sides based on the selected shape
    if (shapeSelect.value === "hexagon") sides = 6;
    else if (shapeSelect.value === "heptagon") sides = 7;
    else if (shapeSelect.value === "octagon") sides = 8;
    else if (shapeSelect.value === "nonagon") sides = 9;
    else if (shapeSelect.value === "decagon") sides = 10;
  
    if (sides > 0) {
      ctx.beginPath();
  
      let previousX = 0;
      let previousY = 0;
  
      for (let i = 0; i <= sides; i++) {
        // Calculate the angle for each vertex
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
  
        if (i === 0) {
          // Move to the first vertex
          ctx.moveTo(x, y);
        } else {
          // Add rounded corners using arcTo
          ctx.arcTo(previousX, previousY, x, y, borderRadius);
        }
  
        previousX = x;
        previousY = y;
      }
  
      ctx.closePath(); // Close the shape
      ctx.fill();
      ctx.stroke();
    }
  }
  

  ctx.restore(); // Restore the context to its previous state

  if (selectedShape === shape) {
    drawResizeHandles(shape); // Draw resize handles for the selected shape
  }
}

// Save button functionality
saveButton?.addEventListener("click", () => {
  if (selectedShape) {
    const imageUrl = canvas.toDataURL("image/png"); // Get the image URL of the canvas
    const link = document.createElement("a"); // Create a temporary link element
    link.href = imageUrl; // Set the link's href to the image URL
    link.download = "canvas-image.png"; // Set the download filename
    link.click(); // Trigger the download
  }
});


// Detect if a point is inside a shape
function isPointInShape(x: number, y: number, shape: Shape): boolean {
  return (
    x >= shape.x &&
    x <= shape.x + shape.width &&
    y >= shape.y &&
    y <= shape.y + shape.height
  );
}

// Detect if a point is inside a resize handle
function getResizeHandle(x: number, y: number, shape: Shape): 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | null {
  const handleSize = 10;

  if (
    x >= shape.x - handleSize / 2 &&
    x <= shape.x + handleSize / 2 &&
    y >= shape.y - handleSize / 2 &&
    y <= shape.y + handleSize / 2
  ) {
    return 'top-left';
  }

  if (
    x >= shape.x + shape.width - handleSize / 2 &&
    x <= shape.x + shape.width + handleSize / 2 &&
    y >= shape.y - handleSize / 2 &&
    y <= shape.y + handleSize / 2
  ) {
    return 'top-right';
  }

  if (
    x >= shape.x - handleSize / 2 &&
    x <= shape.x + handleSize / 2 &&
    y >= shape.y + shape.height - handleSize / 2 &&
    y <= shape.y + shape.height + handleSize / 2
  ) {
    return 'bottom-left';
  }

  if (
    x >= shape.x + shape.width - handleSize / 2 &&
    x <= shape.x + shape.width + handleSize / 2 &&
    y >= shape.y + shape.height - handleSize / 2 &&
    y <= shape.y + shape.height + handleSize / 2
  ) {
    return 'bottom-right';
  }

  return null;
}

// Event listeners for drawing and resizing
canvas.addEventListener("mousedown", (e: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (currentShape && getResizeHandle(x, y, currentShape)) {
    resizingHandle = getResizeHandle(x, y, currentShape);
    interactionMode = "resizing";
  } else if (currentShape && isPointInShape(x, y, currentShape)) {
    selectedShape = currentShape;
    interactionMode = "moving";
    offsetX = x - selectedShape.x;
    offsetY = y - selectedShape.y;
  } else {
    currentShape = {
      x,
      y,
      width: 0,
      height: 0,
      color: colorPicker?.value || "#000",
      strokeWidth: parseInt(strokeWidthInput?.value || "1", 10),
      borderRadius: parseInt(borderRadiusInput?.value || "0", 10),
    };
    isDrawing = true;
  }
});

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  if (isDrawing && currentShape) {
    currentShape.width = x - currentShape.x;
    currentShape.height = y - currentShape.y;
    drawShape(currentShape);
  } else if (interactionMode === "moving" && selectedShape) {
    selectedShape.x = x - offsetX;
    selectedShape.y = y - offsetY;
    drawShape(selectedShape);
  } else if (interactionMode === "resizing" && selectedShape && resizingHandle) {
    if (resizingHandle === "top-left") {
      selectedShape.width += selectedShape.x - x;
      selectedShape.height += selectedShape.y - y;
      selectedShape.x = x;
      selectedShape.y = y;
    } else if (resizingHandle === "top-right") {
      selectedShape.width = x - selectedShape.x;
      selectedShape.height += selectedShape.y - y;
      selectedShape.y = y;
    } else if (resizingHandle === "bottom-left") {
      selectedShape.width += selectedShape.x - x;
      selectedShape.height = y - selectedShape.y;
      selectedShape.x = x;
    } else if (resizingHandle === "bottom-right") {
      selectedShape.width = x - selectedShape.x;
      selectedShape.height = y - selectedShape.y;
    }
    drawShape(selectedShape);
  }
});

canvas.addEventListener("mouseup", () => {
  isDrawing = false;
  interactionMode = "none";
  resizingHandle = null;
});

// Event listeners for shape configuration
if (shapeSelect && colorPicker && strokeWidthInput && borderRadiusInput) {
  shapeSelect.addEventListener("change", () => {
    if (selectedShape) {
      drawShape(selectedShape);
    }
  });

  colorPicker.addEventListener("input", () => {
    if (selectedShape) {
      selectedShape.color = colorPicker.value;
      drawShape(selectedShape);
    }
  });

  strokeWidthInput.addEventListener("input", () => {
    if (selectedShape) {
      selectedShape.strokeWidth = parseInt(strokeWidthInput.value, 10);
      drawShape(selectedShape);
    }
  });

  borderRadiusInput.addEventListener("input", () => {
    if (selectedShape) {
      selectedShape.borderRadius = parseInt(borderRadiusInput.value, 10);
      drawShape(selectedShape);
    }
  });

// Save button functionality
saveButton?.addEventListener("click", () => {
  if (selectedShape) {
    const imageUrl = canvas.toDataURL("image/png"); // Get the image URL of the canvas
    const link = document.createElement("a"); // Create a temporary link element
    link.href = imageUrl; // Set the link's href to the image URL
    link.download = "canvas-image.png"; // Set the download filename
    link.click(); // Trigger the download
  }
});
}
