import { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';

const CanvasSection = ({ canvasData, updateCanvas, canvasImages, addCanvasImage, removeCanvasImage }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const textInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [tool, setTool] = useState('pen');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [snapshot, setSnapshot] = useState(null);
  const [isTextMode, setIsTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
  const [fontSize, setFontSize] = useState(16);
  const [selectedImageId, setSelectedImageId] = useState(null);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [imageDragOffset, setImageDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (canvas && container) {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = 400;
      
      if (canvasData) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          redrawCanvasImages();
        };
        img.src = canvasData;
      } else {
        redrawCanvasImages();
      }
    }
  }, [canvasData]);

  const redrawCanvasImages = () => {
    if (!canvasImages || canvasImages.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    canvasImages.forEach(imgData => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, imgData.x, imgData.y, imgData.width, imgData.height);
      };
      img.src = imgData.url;
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxWidth = 200;
          const maxHeight = 200;
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = width * ratio;
            height = height * ratio;
          }
          
          addCanvasImage({
            id: Date.now(),
            url: event.target.result,
            x: 50,
            y: 50,
            width: width,
            height: height
          });
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleImageMouseDown = (e, imageId) => {
    e.stopPropagation();
    const pos = getCanvasCoordinates(e);
    const image = canvasImages.find(img => img.id === imageId);
    
    if (image) {
      setSelectedImageId(imageId);
      setIsDraggingImage(true);
      setImageDragOffset({
        x: pos.x - image.x,
        y: pos.y - image.y
      });
    }
  };

  const handleImageDrag = (e) => {
    if (!isDraggingImage || !selectedImageId) return;
    
    const pos = getCanvasCoordinates(e);
    const updatedImages = canvasImages.map(img => {
      if (img.id === selectedImageId) {
        return {
          ...img,
          x: pos.x - imageDragOffset.x,
          y: pos.y - imageDragOffset.y
        };
      }
      return img;
    });
    
    // Redraw canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (canvasData) {
      const baseImg = new Image();
      baseImg.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseImg, 0, 0);
        
        updatedImages.forEach(imgData => {
          const img = new Image();
          img.src = imgData.url;
          ctx.drawImage(img, imgData.x, imgData.y, imgData.width, imgData.height);
        });
      };
      baseImg.src = canvasData;
    }
  };

  const handleImageMouseUp = () => {
    if (isDraggingImage) {
      setIsDraggingImage(false);
      const canvas = canvasRef.current;
      updateCanvas(canvas.toDataURL());
    }
  };

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleCanvasClick = (e) => {
    if (tool === 'text') {
      const pos = getCanvasCoordinates(e);
      setTextPosition(pos);
      setIsTextMode(true);
      setTimeout(() => textInputRef.current?.focus(), 0);
    }
  };

  const addTextToCanvas = () => {
    if (!textInput.trim()) {
      setIsTextMode(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    ctx.fillText(textInput, textPosition.x, textPosition.y);
    
    updateCanvas(canvas.toDataURL());
    setTextInput('');
    setIsTextMode(false);
  };

  const handleTextKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTextToCanvas();
    } else if (e.key === 'Escape') {
      setIsTextMode(false);
      setTextInput('');
    }
  };

  const startDrawing = (e) => {
    if (tool === 'text') return; // Don't draw when in text mode
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasCoordinates(e);
    
    setIsDrawing(true);
    setStartPos(pos);
    
    // Save canvas state for shape drawing
    if (tool !== 'pen' && tool !== 'eraser') {
      setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
    
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (tool === 'pen') {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, lineWidth * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getCanvasCoordinates(e);
    
    if (tool === 'pen') {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    } else if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, lineWidth * 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Restore snapshot for shape preview
      ctx.putImageData(snapshot, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      
      const width = pos.x - startPos.x;
      const height = pos.y - startPos.y;
      
      if (tool === 'rectangle') {
        ctx.strokeRect(startPos.x, startPos.y, width, height);
      } else if (tool === 'circle') {
        const radius = Math.sqrt(width * width + height * height);
        ctx.beginPath();
        ctx.arc(startPos.x, startPos.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      } else if (tool === 'arrow') {
        drawArrow(ctx, startPos.x, startPos.y, pos.x, pos.y);
      }
    }
  };

  const drawArrow = (ctx, fromX, fromY, toX, toY) => {
    const headLength = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
    
    // Draw arrow head
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle - Math.PI / 6),
      toY - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(toX, toY);
    ctx.lineTo(
      toX - headLength * Math.cos(angle + Math.PI / 6),
      toY - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.globalCompositeOperation = 'source-over';
      updateCanvas(canvas.toDataURL());
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateCanvas(canvas.toDataURL());
  };

  const tools = [
    { id: 'pen', name: 'Pen', icon: '✏️' },
    { id: 'eraser', name: 'Eraser', icon: '🧹' },
    { id: 'text', name: 'Text', icon: '📝' },
    { id: 'image', name: 'Image', icon: '🖼️' },
    { id: 'line', name: 'Line', icon: '📏' },
    { id: 'arrow', name: 'Arrow', icon: '➡️' },
    { id: 'rectangle', name: 'Rectangle', icon: '⬜' },
    { id: 'circle', name: 'Circle', icon: '⭕' },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Palette className="text-blue-600" size={16} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Drawing Canvas</h3>
        </div>
        <button
          onClick={clearCanvas}
          className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
        >
          Clear Canvas
        </button>
      </div>
      
      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <label className="text-sm font-medium text-gray-700">Tools:</label>
          <div className="flex flex-wrap gap-1">
            {tools.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setTool(t.id);
                  if (t.id === 'image') {
                    imageInputRef.current?.click();
                  } else if (t.id !== 'text') {
                    setIsTextMode(false);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  tool === t.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
                title={t.name}
              >
                {t.icon} {t.name}
              </button>
            ))}
          </div>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        
        <div className="flex items-center space-x-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Color:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-300"
            />
          </div>
          {tool === 'text' ? (
            <div className="flex items-center space-x-3 flex-1">
              <label className="text-sm font-medium text-gray-700">Font Size:</label>
              <input
                type="range"
                min="10"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 font-medium w-12">{fontSize}px</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3 flex-1">
              <label className="text-sm font-medium text-gray-700">Size:</label>
              <input
                type="range"
                min="1"
                max="20"
                value={lineWidth}
                onChange={(e) => setLineWidth(e.target.value)}
                className="flex-1"
              />
              <span className="text-sm text-gray-600 font-medium w-12">{lineWidth}px</span>
            </div>
          )}
        </div>
      </div>
      
      <div ref={containerRef} className="relative border-2 border-gray-200 rounded-lg overflow-hidden bg-white">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseDown={startDrawing}
          onMouseMove={(e) => {
            draw(e);
            handleImageDrag(e);
          }}
          onMouseUp={(e) => {
            stopDrawing();
            handleImageMouseUp();
          }}
          onMouseLeave={(e) => {
            stopDrawing();
            handleImageMouseUp();
          }}
          className={`w-full ${tool === 'text' ? 'cursor-text' : 'cursor-crosshair'}`}
          style={{ display: 'block' }}
        />
        
        {canvasImages && canvasImages.map((image) => (
          <div
            key={image.id}
            className="absolute border-2 border-blue-500 cursor-move group"
            style={{
              left: `${(image.x / canvasRef.current?.width) * 100}%`,
              top: `${(image.y / 400) * 100}%`,
              width: `${(image.width / canvasRef.current?.width) * 100}%`,
              height: `${(image.height / 400) * 100}%`,
            }}
            onMouseDown={(e) => handleImageMouseDown(e, image.id)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeCanvasImage(image.id);
              }}
              className="absolute -top-2 -right-2 bg-white hover:bg-red-50 text-red-600 p-1 rounded-full shadow-sm border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        {isTextMode && (
          <div 
            className="absolute bg-white border-2 border-blue-500 rounded shadow-lg"
            style={{
              left: `${(textPosition.x / canvasRef.current.width) * 100}%`,
              top: `${(textPosition.y / canvasRef.current.height) * 100}%`,
              transform: 'translate(0, -100%)',
            }}
          >
            <input
              ref={textInputRef}
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleTextKeyDown}
              onBlur={addTextToCanvas}
              placeholder="Type text..."
              className="px-3 py-2 outline-none text-sm"
              style={{ 
                fontSize: `${fontSize}px`,
                color: color,
                minWidth: '200px'
              }}
            />
            <div className="px-2 py-1 bg-gray-50 border-t text-xs text-gray-500">
              Press Enter to add, Esc to cancel
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CanvasSection;