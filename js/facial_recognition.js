// Asegúrate de que este archivo esté vinculado en tu HTML de inicio de sesión

// Variables globales
let faceMatcher = null;

async function iniciarReconocimientoFacial() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const resultadoDiv = document.getElementById('resultado');
    const displaySize = { width: video.width, height: video.height };

    // Cargar modelos de face-api
    await Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]);

    // Cargar imágenes etiquetadas
    faceMatcher = await cargarImagenesEtiquetadas();

    // Iniciar la cámara
    navigator.mediaDevices.getUserMedia({ video: {} })
        .then(stream => video.srcObject = stream)
        .catch(err => console.error('Error al acceder a la cámara:', err));

    video.addEventListener('play', () => {
        const canvas = faceapi.createCanvasFromMedia(video);
        document.body.append(canvas);
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video).withFaceLandmarks().withFaceDescriptors();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            
            const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor));
            results.forEach((result, i) => {
                const box = resizedDetections[i].detection.box;
                const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() });
                drawBox.draw(canvas);
            });

            if (results.length > 0 && results[0].label !== 'unknown') {
                resultadoDiv.innerText = `Usuario reconocido: ${results[0].label}`;
                // Aquí puedes agregar lógica para iniciar sesión automáticamente
            }
        }, 100);
    });
}

async function cargarImagenesEtiquetadas() {
    // Hacer una solicitud al servidor para obtener las imágenes de los usuarios
    const response = await fetch('obtener_imagenes_usuarios.php');
    const usuarios = await response.json();

    const labeledFaceDescriptors = await Promise.all(
        usuarios.map(async (usuario) => {
            const img = await faceapi.fetchImage(usuario.imagen_facial);
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (!detection) {
                console.error(`No se pudo detectar cara para el usuario ${usuario.username}`);
                return null;
            }
            return new faceapi.LabeledFaceDescriptors(usuario.username, [detection.descriptor]);
        })
    );

    // Filtrar los descriptores nulos
    return new faceapi.FaceMatcher(labeledFaceDescriptors.filter(descriptor => descriptor !== null));
}
