// Obtener el elemento de video
const video = document.getElementById('video')

// Función para iniciar la cámara
const cargarCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({video: {}});
    video.srcObject = stream;
};

// Compatibilidad con navegadores antiguos
navigator.getMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

// Cargar modelos de face-api.js
Promise.all([
     faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
     faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
     faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
     faceapi.nets.faceExpressionNet.loadFromUri('/models'),
     faceapi.nets.ageGenderNet.loadFromUri('/models'),
     faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
]).then(cargarCamera)

// Evento que se dispara cuando el video comienza a reproducirse
video.addEventListener('play', async () => {
  // Crear canvas para dibujar detecciones
  const canvas = faceapi.createCanvasFromMedia(document.getElementById('video'))
  document.body.append(canvas);

  // Ajustar dimensiones del canvas al video
  const displaySize = {width: video.width, height: video.height}
  faceapi.matchDimensions(canvas, displaySize)

  // Variables para controlar la frecuencia de capturas
  let lastCaptureTime = 0;
  const captureInterval = 10000; // 10 segundos entre capturas

  // Bucle principal de detección
  setInterval(async() => {
    // Detectar rostros y sus características
    const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
        .withFaceLandmarks()
        .withFaceExpressions()
        .withAgeAndGender()
        .withFaceDescriptors()

    // Ajustar detecciones al tamaño del canvas
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Dibujar detecciones y expresiones en el canvas
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections)
    
    // Procesar cada detección
    resizedDetections.forEach(detection => {
      const { gender, expressions } = detection
      const bottomRight = {
        x: detection.detection.box.bottomRight.x,
        y: detection.detection.box.bottomRight.y + 15 // Ajusta este valor para mover el texto más abajo si es necesario
      }
      new faceapi.draw.DrawTextField(
        [
          `${gender}`
        ],
        bottomRight
      ).draw(canvas)

      // Verificar si hay una sonrisa y capturar la imagen
      if (expressions.happy > 0.8 && Date.now() - lastCaptureTime > captureInterval) {
        captureImage();
        lastCaptureTime = Date.now();
      }

    })

  }, 20)

})

// Cargar el contador de capturas y los archivos existentes desde localStorage
let captureCounter = parseInt(localStorage.getItem('captureCounter')) || 0;
const existingFiles = new Set(JSON.parse(localStorage.getItem('existingFiles')) || []);

// Añadir una variable global para controlar si se ha tomado una captura
let hasCaptured = false;

// Tiempo de espera para permitir una nueva captura (en milisegundos)
const captureCooldown = 10000; // 9 segundos


// Función para capturar y descargar la imagen del video
function captureImage() {
  // Si ya se ha capturado una imagen, no hacer nada
  if (hasCaptured) return;

  // Inicializar el contador de capturas
  let newCaptureCounter = captureCounter + 1;

  // Crear un nombre base para el archivo
  let fileName = `captura_${newCaptureCounter}.png`;

  // Verificar si el archivo ya existe y encontrar el siguiente número disponible
  while (existingFiles.has(fileName)) {
    newCaptureCounter++;
    fileName = `captura_${newCaptureCounter}.png`; // Actualizar el nombre del archivo
  }

  // Actualizar el contador de capturas
  captureCounter = newCaptureCounter;

  // Crear un canvas temporal para capturar la imagen del video
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = video.videoWidth;
  tempCanvas.height = video.videoHeight;
  tempCanvas.getContext('2d').drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
  
  // Crear un enlace de descarga y activarlo
  const link = document.createElement('a');
  link.download = fileName; // Usar el nombre de archivo único
  link.href = tempCanvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  console.log(`Imagen capturada y descargada: ${fileName}`);

  // Agregar el nombre del archivo al conjunto de archivos existentes
  existingFiles.add(fileName);
  localStorage.setItem('existingFiles', JSON.stringify(Array.from(existingFiles))); // Guardar en localStorage

  // Guardar el contador de capturas en localStorage
  localStorage.setItem('captureCounter', captureCounter);

  // Establecer la bandera para indicar que se ha tomado una captura
  hasCaptured = true;

  // Reiniciar la detección después de un tiempo
  setTimeout(() => {
    hasCaptured = false; // Permitir una nueva captura después del tiempo de espera
  }, captureCooldown);
}

// Función para verificar si un archivo ya existe (simulación)
function fileExists(fileName) {
  return existingFiles.has(fileName); // Verificar si el nombre de archivo ya existe
}

// Bucle principal de detección
setInterval(async () => {
  // Detectar rostros y sus características
  const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .withFaceDescriptors();


      const displaySize = {width: video.width, height: video.height}
      const canvas = faceapi.createCanvasFromMedia(document.getElementById('video'))

  // Ajustar detecciones al tamaño del canvas
  const resizedDetections = faceapi.resizeResults(detections, displaySize);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Dibujar detecciones y expresiones en el canvas
  faceapi.draw.drawDetections(canvas, resizedDetections);
  faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
  
  // Procesar cada detección
  resizedDetections.forEach(detection => {
    const { expressions } = detection;

    // Verificar si hay una sonrisa y capturar la imagen
    if (expressions.happy > 0.8) {
      captureImage(); // Llamar a la función de captura
    }
  });


},
);

video.addEventListener('loadedmetadata', () => {
  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  // Aquí puedes iniciar tu lógica de detección
});

