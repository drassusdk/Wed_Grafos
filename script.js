const canvas = document.getElementById('canvas');  // manipulacion del lienzo
const ctx = canvas.getContext('2d');              // se utiliza para realizar operaciones de dibujo

let nodes = []; //arreglo de nodos
let edges = [];//arreglo de aristas
let nodeCounter = 1;//contador de nodos

let lost = []; //arreglo para guardar nombres de nodos 
let cEracer = 0; let cRename = 0; let save = 1;//contadores extras

// Variable para rastrear si se está arrastrando
let draggingNode = null;
let offsetX, offsetY;

// variables para cronometro
let startTime;
let endTime;


canvas.addEventListener('dblclick', function (event) {//1) tomar las cordenadas x y y para los nodos
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  addNode(x, y);//
});

function addNode(x, y) {//2) agregar nodo
  const node = { name: nodeCounter, x: x, y: y, color: '#ffcc00', type: "normal" };



  if (nodes.length <= 1) {


    if (nodes.length === 0) { node.name = "I"; node.type = "Inicial" }
    else { node.name = "F"; node.type = "Final" }

    node.color = '#1900ff';
    nodeCounter--;

  } else {
    const x = nodes[1].x;
    const y = nodes[1].y;

    nodes[1].x = node.x;
    nodes[1].y = node.y;

    node.x = x;
    node.y = y;

    drawNodes()

  }
  nodes.push(node);


  if (cEracer > 0 && cRename < cEracer) {//heredado de nombres
    node.name = lost[cRename];
    lost[cRename] = 0;
    cRename++;
  } else {
    nodeCounter++;
  }

  drawNode(node, node.color);
  updateSelects();
}

function drawNodes() {//3) redibujar todos los nodos
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const node of nodes) {
    drawNode(node, node.color);
  }
  drawEdges();
}

function drawNode(node, color) {//4) dibujar nodos
  ctx.beginPath();
  ctx.arc(node.x, node.y, 18, 0, 2 * Math.PI);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.font = "12px Arial";
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.fillText("n" + node.name, node.x, node.y + 3);
}

function deleteNode() {//5) borrar nodos y sus aristas
  const deleteNode = parseInt(document.getElementById('editNode').value);
  nodes = nodes.filter((node) => node.name !== deleteNode);
  edges = edges.filter((edge) => edge.start !== deleteNode && edge.end !== deleteNode);
  drawNodes();
  updateSelects();

  if (nodes.length == 0) {//guardado de difuntos
    nodeCounter = 1;
    cEracer = 0
  } else {
    lost[cEracer] = deleteNode;
    cEracer++;
  }
  lost.sort(function (a, b) { return a - b; });
}

function addEdge() {//7) agregar aristas
  const startNodeValue = document.getElementById('startNode').value
  const endNodeValue = document.getElementById('endNode').value;
  const edgeValue = parseInt(document.getElementById('edgeValue').value);

  if (isNaN(edgeValue) || edgeValue === 0) {
    const confirmed = confirm('No se ha establecido un valor válido para la arista.');
    if (confirmed) {

    }
  } else {
    let startNodeIndex = parseInt(startNodeValue);
    if (!startNodeIndex) { startNodeIndex = startNodeValue }

    let endNodeIndex = parseInt(endNodeValue);
    if (!endNodeIndex) { endNodeIndex = endNodeValue }

    const edge = { start: startNodeIndex, end: endNodeIndex, value: edgeValue, color: '#000000' }

    edges.push(edge);


    let startNode = nodes.find(node => node.name === startNodeIndex);
    let endNode = nodes.find(node => node.name === endNodeIndex);




    drawEdge(startNode.x, startNode.y, endNode.x, endNode.y, edgeValue, edge.color);
    updateSelects();
  }
}

function drawEdge(startX, startY, endX, endY, value, color) {//8)dibujar aristas 
  const startRadius = 18;
  const endRadius = 18;

  // Calcular de las medidas de la arista
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx * dx + dy * dy);

  const startArrowX = startX + (dx * startRadius) / length;
  const startArrowY = startY + (dy * startRadius) / length;
  const endArrowX = endX - (dx * endRadius) / length;
  const endArrowY = endY - (dy * endRadius) / length;

  // Dibujar la línea
  ctx.beginPath();
  ctx.moveTo(startArrowX, startArrowY);
  ctx.lineTo(endArrowX, endArrowY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dibujar la flecha
  const arrowSize = 8;
  const angle = Math.atan2(endArrowY - startArrowY, endArrowX - startArrowX);
  const arrowStartX = endArrowX - Math.cos(angle) * arrowSize;
  const arrowStartY = endArrowY - Math.sin(angle) * arrowSize;

  ctx.beginPath();
  ctx.moveTo(endArrowX, endArrowY);
  ctx.lineTo(
    arrowStartX - Math.cos(angle - Math.PI / 6) * arrowSize,
    arrowStartY - Math.sin(angle - Math.PI / 6) * arrowSize
  );
  ctx.moveTo(endArrowX, endArrowY);
  ctx.lineTo(
    arrowStartX - Math.cos(angle + Math.PI / 6) * arrowSize,
    arrowStartY - Math.sin(angle + Math.PI / 6) * arrowSize
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Dibujar el valor 
  const labelX = (startArrowX + endArrowX) / 2.09;
  const labelY = (startArrowY + endArrowY) / 2.09;

  ctx.font = '15px Arial';
  ctx.fillStyle = '#000';
  ctx.textAlign = 'center';

  if (value == 0) {
    ctx.font = '26px Arial';
    ctx.fillText("∞", labelX, labelY);
  } else {
    ctx.fillText(value.toString(), labelX, labelY);
  }

}

function drawEdges() {//9) redibujara aristas
  for (const edge of edges) {
    const startNode = nodes.find(node => node.name === edge.start);
    const endNode = nodes.find(node => node.name === edge.end);
    drawEdge(startNode.x, startNode.y, endNode.x, endNode.y, edge.value, edge.color);
  }
}

function deleteEdge() {//10) borrar una arista en especifico
  const deleteEdgeIndex = parseInt(document.getElementById('editEdge').value);

  edges.splice(deleteEdgeIndex, 1);


  drawNodes();
  updateSelects();
}

function changeEdgeValue() {//11) cambiar el valor de las aristas
  save = 0
  const changeEdgeIndex = parseInt(document.getElementById('editEdge').value);
  const newValue = parseInt(document.getElementById('newValue').value);
  edges[changeEdgeIndex].value = newValue;
  drawNodes();
}

function updateSelects() {//12) actualizacion de los datos de los select
  save = 0;
  // select de nodos
  const startNodeSelect = document.getElementById('startNode');
  const endNodeSelect = document.getElementById('endNode');
  const editNodeSelect = document.getElementById('editNode');
  // select de aristas
  const editEdgeSelect = document.getElementById('editEdge');

  editNodeSelect.innerHTML = '';
  startNodeSelect.innerHTML = '';
  endNodeSelect.innerHTML = '';
  editEdgeSelect.innerHTML = '';

  // Agregar nodos al select


  for (const node of nodes) {
    const option = document.createElement('option');
    option.value = node.name;
    option.text = `Nodo ${node.name}`;
    startNodeSelect.add(option);

    const option2 = document.createElement('option');
    option2.value = node.name;
    option2.text = `Nodo ${node.name}`;
    endNodeSelect.add(option2);

    const option3 = document.createElement('option');
    option3.value = node.name;
    option3.text = `Nodo ${node.name}`;
    editNodeSelect.add(option3);
  }

  // Agregar aristas al select
  for (const edge of edges) {
    const option = document.createElement('option');
    option.value = edges.indexOf(edge);
    option.text = `Arista ${edge.start} - ${edge.end}`;
    editEdgeSelect.add(option);
  }
}

function newProject() {//13) borrar todo 

  if (save == 0) {
    const confirmed = confirm('Aun hay cambios sin guardar ¿Desea continuar?');

    if (confirmed) {
      nodes = [];
      edges = [];
      lost = [];
      updateSelects();
      nodeCounter = 1;
      cEracer = 0; cRename = 0; save = 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  } else {
    nodes = [];
    edges = [];
    lost = [];
    updateSelects();
    nodeCounter = 1;
    cEracer = 0; cRename = 0; save = 0;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  save = 1
}

function saveProject() {//14)  Guardar el proyecto
  const data = JSON.stringify({ nodes: nodes, edges: edges });
  const blob = new Blob([data], { type: 'application/json' });
  const jsonUrl = URL.createObjectURL(blob);

  // Guardar el archivo JSON
  const jsonLink = document.createElement('a');
  jsonLink.href = jsonUrl;
  jsonLink.download = 'Grafo.json';
  jsonLink.click();
  URL.revokeObjectURL(jsonUrl);

  save = 1;
}

function saveImg() {//15)  Guardar como imagen
  const canvasImage = document.createElement('canvas');
  canvasImage.width = canvas.width;
  canvasImage.height = canvas.height;
  const ctxImage = canvasImage.getContext('2d');

  // Dibujar el fondo blanco en el lienzo de imagen
  ctxImage.fillStyle = '#ffffff';
  ctxImage.fillRect(0, 0, canvasImage.width, canvasImage.height);

  // Dibujar la imagen del lienzo original en el lienzo de imagen
  ctxImage.drawImage(canvas, 0, 0);

  canvasImage.toBlob(function (blob) {
    const imageUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'Grafo.png';
    link.click();

    URL.revokeObjectURL(imageUrl);
  }, 'image/png');
}

function openProject() {//16) abrir proyecto desde archivo JSON
  const input = document.createElement('input');

  input.type = 'file';
  input.accept = 'application/json';
  input.click();

  input.onchange = function (event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = function (event) {
      const data = JSON.parse(event.target.result);
      nodes = data.nodes;
      edges = data.edges;

      let max = 0;
      for (const node of nodes) {
        if (node.name > max) {
          max = node.name;
        }
      }

      nodeCounter = max + 1;

      drawNodes();
      updateSelects();
    };

  };

}


//Funciones para moviemiento de los nodos
function startDraggingNode(node, x, y) {
  draggingNode = node;
  offsetX = x - node.x;
  offsetY = y - node.y;
}

function stopDraggingNode() {
  draggingNode = null;
}

canvas.addEventListener('mousedown', function (event) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - rect.left;
  const mouseY = event.clientY - rect.top;

  for (const node of nodes) {
    const distance = Math.sqrt((mouseX - node.x) ** 2 + (mouseY - node.y) ** 2);
    if (distance <= 18) {
      startDraggingNode(node, mouseX, mouseY);
      break;
    }
  }
});

canvas.addEventListener('mousemove', function (event) {
  if (draggingNode) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    draggingNode.x = mouseX - offsetX;
    draggingNode.y = mouseY - offsetY;

    drawNodes();
  }
});

canvas.addEventListener('mouseup', function () {
  stopDraggingNode();
});



//algotimo de distrak
function dijkstra(startNodeName) {
  const distances = {};
  const visited = {};
  const queue = [];

  // Inicializar las distancias y la cola de prioridad
  for (const node of nodes) {
    distances[node.name] = Infinity;
    visited[node.name] = false;
    queue.push(node.name);
  }

  distances[startNodeName] = 0;

  while (queue.length > 0) {
    // Ordenar la cola por distancia
    queue.sort((a, b) => distances[a] - distances[b]);

    const currentNodeName = queue.shift();
    const currentNode = nodes.find(node => node.name === currentNodeName);

    // Marcar el nodo como visitado
    visited[currentNodeName] = true;

    for (const edge of edges) {
      if (edge.start === currentNodeName && !visited[edge.end]) {
        const newDistance = distances[currentNodeName] + edge.value;

        if (newDistance < distances[edge.end]) {
          distances[edge.end] = newDistance;
        }
      }
    }
  }

  return distances;
}

function findNodeByType(type) {// Función para encontrar el nodo según su tipo
  return nodes.find(node => node.type === type);
}

function findShortestPath() {// Función para encontrar el camino más corto entre el nodo inicial y final

  startTime = performance.now();//inicio del cronometro

  const startNode = findNodeByType("Inicial");
  const endNode = findNodeByType("Final");

  // Función dijkstra implementada anteriormente
  const distances = dijkstra(startNode.name);

  // Reconstruir el camino más corto
  let currentNode = endNode;
  const shortestPath = [currentNode];

  while (currentNode.name !== startNode.name) {
    const incomingEdge = edges.find(edge => edge.end === currentNode.name && distances[edge.start] === distances[currentNode.name] - edge.value);
    const previousNode = nodes.find(node => node.name === incomingEdge.start);
    shortestPath.unshift(previousNode);
    currentNode = previousNode;
  }

  endTime = performance.now();//final del cronometro



  return shortestPath;
}

function Dijkstraboton() {// Uso de la función 



  const camino = findShortestPath();
  console.log("Camino más corto:", camino);

  for (let x = 0; x < nodes.length; x++) {//cambio de color de los nodos
    let controlador = false;

    for (let y = 0; y < camino.length; y++) {

      if (nodes[x] === camino[y]) { controlador = true; 
        
        if(nodes[x].type!="Inicial" && nodes[x].type!="Final"){
          nodes[x].color='#ffcc00'}
        }
        
        

    }

    if (controlador === false) { nodes[x].color = '#676769' }

  }

  for (let x = 0; x < edges.length; x++) {//cambio de color de los aristas


    for (let y = 0; y < camino.length; y++) {

      if (edges[x].start === camino[y].name && edges[x].end === camino[y + 1].name) {

        edges[x].color = '#111111'
      }

    }

    if(edges[x].color === '#111111'){edges[x].color ='#000000'}
    else{edges[x].color ='#a1a1a3'}

  }


  drawNodes();
  time(endTime - startTime);

}

function time(duration) {

  console.log("Duracion: " + duration + ' milisegundos');


  const frase = "Duracion: 0h 0m  " + duration.toFixed(2)/1000+ 's';
  ctx.font = '15px Arial';
  ctx.fillStyle = 'black';

  // Dibujar la frase en el canvas
  ctx.fillText(frase, 700, 30);

  startTime = 0;
  endTime = 0;


}



