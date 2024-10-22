// Asegúrate de que este archivo esté vinculado en tu HTML de inicio de sesión

// Variables globales
let faceMatcher = null;

async function iniciarReconocimientoFacial() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const displaySize = { width: video.width, height: video.height };

    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;

    video.addEventListener('play', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        faceapi.matchDimensions(canvas, displaySize);

        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
                .withFaceLandmarks()
                .withFaceExpressions();
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
        }, 100);
    });
}

async function cargarModelos() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/reconocimiento/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/reconocimiento/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/reconocimiento/models');
    await faceapi.nets.faceExpressionNet.loadFromUri('/reconocimiento/models');
}

async function reconocerRostros() {
    const video = document.getElementById('video');
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100);
}

async function cargarImagenesEtiquetadas() {
    const response = await fetch('php/obtener_imagenes_usuarios.php');
    const usuarios = await response.json();

    const labeledFaceDescriptors = await Promise.all(
        usuarios.map(async (usuario) => {
            const img = await faceapi.fetchImage(usuario.facial_image_path);
            const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
            if (!detection) {
                console.error(`No se pudo detectar cara para el usuario ${usuario.username}`);
                return null;
            }
            return new faceapi.LabeledFaceDescriptors(usuario.username, [detection.descriptor]);
        })
    );

    return new faceapi.FaceMatcher(labeledFaceDescriptors.filter(descriptor => descriptor !== null));
}

async function capturarImagenFacial() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    // Capturar la imagen del video
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convertir la imagen a base64 y guardarla en el input oculto
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    document.getElementById('facial_image').value = imageDataUrl;

    alert('Imagen facial capturada con éxito');
}

async function iniciarCamara() {
    const video = document.getElementById('video');
    const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
    video.srcObject = stream;
}

function capturarImagen() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    document.getElementById('facial_image').value = canvas.toDataURL('image/jpeg');
    alert('Imagen capturada');
}

document.addEventListener('DOMContentLoaded', iniciarReconocimientoFacial);

document.getElementById('registroForm').onsubmit = function(e) {
    if (!document.getElementById('facial_image').value) {
        e.preventDefault();
        alert('Por favor, capture una imagen facial antes de registrarse.');
    }
};
