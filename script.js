const canvas = document.getElementById('canvas');  // manipulacion del lienzo
const ctx = canvas.getContext('2d');              // se utiliza para realizar operaciones de dibujo

let nodes = []; //arreglo de nodos
let nodesF = []; //arreglo de nodos
let edges = [];//arreglo de aristas
let nodeCounter = 1;//contador de nodos

let lost = [];                      //arreglo para guardar nombres de nodos 
let cEracer = 0; let cRename = 0; let save=1;//contadores extras


canvas.addEventListener('dblclick', function (event) {//1) tomar las cordenadas x y y para los nodos
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  addNode(x, y);//
});

function addNode(x, y) {//2) agregar nodo
  const node = { name: nodeCounter, x: x, y: y, color: '#ffcc00' };



  if (nodesF.length <= 1) {

    node.name = "f";
    node.color = '#1900ff';
    nodeCounter--;
    nodesF.push(node);
  } else {

    const x = nodesF[1].x;
    const y = nodesF[1].y;

    nodesF[1].x = node.x;
    nodesF[1].y = node.y;

    node.x = x;
    node.y = y;

    nodes.push(node);
    drawNodes()

  }



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
  for (const node of nodesF) {
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

function changeNodeColor() {//6) cambiar color de nodos
  save = 0
  const selectNodeValue = parseInt(document.getElementById('editNode').value);
  const selectedNode = nodes.find(node => node.name === selectNodeValue);
  if (selectedNode) {
    selectedNode.color = (selectedNode.color === '#ffcc00') ? '#3500f7' : '#ffcc00';
    drawNodes();
  }

}

function addEdge() {//7) agregar aristas
  const startNodeValue = document.getElementById('startNode').value;
  const endNodeValue = document.getElementById('endNode').value;
  let edgeValue = parseInt(document.getElementById('edgeValue').value);

  if (isNaN(edgeValue) || edgeValue === 0) {
    const confirmed = confirm('No se ha establecido un valor válido para la arista.');
    if (confirmed) {

    }
  } else {
    const startNodeIndex = parseInt(startNodeValue);
    const endNodeIndex = parseInt(endNodeValue);

    edges.push({ start: startNodeIndex, end: endNodeIndex, value: edgeValue });

    const startNode = nodes.find(node => node.name === startNodeIndex);
    const endNode = nodes.find(node => node.name === endNodeIndex);

    drawEdge(startNode.x, startNode.y, endNode.x, endNode.y, edgeValue);
    updateSelects();
  }
}

function drawEdge(startX, startY, endX, endY, value) {//8)dibujar aristas 
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
  ctx.strokeStyle = '#000000';
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
  ctx.strokeStyle = '#000000';
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
    drawEdge(startNode.x, startNode.y, endNode.x, endNode.y, edge.value);
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
  save=1
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