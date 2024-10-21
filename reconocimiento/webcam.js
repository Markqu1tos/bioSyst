// Obtener el elemento de video y canvas
const video = document.getElementById('video');
const canvas = document.getElementById('overlay');

// Función para iniciar la cámara
const cargarCamera = async () => {
    try {
        const constraints = {
            video: {
                width: { ideal: 720 }, // Ancho ideal
                height: { ideal: 480 }, // Alto ideal
                facingMode: 'user' // 'user' para la cámara frontal
            }
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log("Stream obtenido:", stream);
        video.srcObject = stream;
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                video.play();
                // Ajustar el tamaño del canvas al video
                canvas.width = video.videoWidth; // Establecer el ancho del canvas
                canvas.height = video.videoHeight; // Establecer la altura del canvas
                resolve();
            };
        });
    } catch (err) {
        console.error("Error al acceder a la cámara: ", err);
    }
};

// Compatibilidad con navegadores antiguos
navigator.getMedia =
  navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

// Cargar modelos de face-api.js
Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('reconocimiento/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('reconocimiento/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('reconocimiento/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('reconocimiento/models'),
    faceapi.nets.ageGenderNet.loadFromUri('reconocimiento/models'),
    faceapi.nets.ssdMobilenetv1.loadFromUri('reconocimiento/models'),
]).then(() => {
    console.log("Modelos cargados correctamente");
    return cargarCamera();
})
.then(() => {
    console.log("Cámara iniciada correctamente");
})
.catch(err => {
    console.error("Error al cargar modelos o iniciar cámara: ", err);
});

// Variables para controlar la frecuencia de capturas
let lastCaptureTime = 0;
const captureInterval = 10000; // 10 segundos entre capturas

// Evento que se dispara cuando el video comienza a reproducirse
video.addEventListener('play', async () => {
  // Crear canvas para dibujar detecciones
  const canvas = faceapi.createCanvasFromMedia(video)
  document.getElementById('video-container').append(canvas);

  // Ajustar dimensiones del canvas al video
  const displaySize = {width: video.videoWidth, height: video.videoHeight}
  faceapi.matchDimensions(canvas, displaySize)

  // Bucle principal de detección
  async function detectFaces() {
    const detections = await faceapi.detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })) // Ajustar la confianza mínima
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender()
      .withFaceDescriptors()

    console.log(detections);

    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    
    if (resizedDetections.length > 0) {
      const detection = resizedDetections[0]; // Tomar solo la primera detección
      faceapi.draw.drawDetections(canvas, [detection]);
      faceapi.draw.drawFaceLandmarks(canvas, [detection]);
      faceapi.draw.drawFaceExpressions(canvas, [detection]);

      const { age, gender, expressions } = detection;
      new faceapi.draw.DrawTextField(
        [
          `${Math.round(age, 0)} years`,
          `${gender}`
        ],
        detection.detection.box.bottomRight
      ).draw(canvas);

      // Verificar si hay una sonrisa y capturar la imagen
      if (expressions.happy > 0.8 && Date.now() - lastCaptureTime > captureInterval) {
        captureImage();
        lastCaptureTime = Date.now();
      }
  }

  requestAnimationFrame(detectFaces)
}

detectFaces()
})
// Cargar el contador de capturas y los archivos existentes desde localStorage
let captureCounter = parseInt(localStorage.getItem('captureCounter')) || 0;
const existingFiles = new Set(JSON.parse(localStorage.getItem('existingFiles')) || []);

// Añadir una variable global para controlar si se ha tomado una captura
let hasCaptured = false;

// Tiempo de espera para permitir una nueva captura (en milisegundos)
const captureCooldown = 10000; // 10 segundos

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

video.addEventListener('loadedmetadata', () => {
  const displaySize = { width: video.videoWidth, height: video.videoHeight };
  // Aquí puedes iniciar tu lógica de detección si es necesario
});

// Borrar el registro del localStorage
localStorage.removeItem('captureCounter'); // Eliminar el contador de capturas
localStorage.removeItem('existingFiles'); // Eliminar los archivos existentes
console.log("Registro del localStorage borrado.");