const express = require('express');
const { createCanvas } = require('canvas');

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/mapa-assentos', (req, res) => {
  const ocupados = Array.isArray(req.body.ocupados) ? req.body.ocupados.map(Number) : [];
  const selecionado = req.body.selecionado ? Number(req.body.selecionado) : null;
  const total = Number(req.body.total_assentos || 29);

  const width = 900;
  const height = 650;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fundo
  ctx.fillStyle = '#efefef';
  ctx.fillRect(0, 0, width, height);

  // Título
  ctx.fillStyle = '#2f2f35';
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('MAPA DE ASSENTOS', width / 2, 70);

  // Corpo do ônibus
  const busX = 120;
  const busY = 120;
  const busW = 660;
  const busH = 330;
  const radius = 28;

  ctx.fillStyle = '#dddddd';
  roundRect(ctx, busX, busY, busW, busH, radius, true, false);

  ctx.fillStyle = '#f7f7f7';
  roundRect(ctx, busX + 8, busY + 8, busW - 16, busH - 16, radius, true, false);

  ctx.strokeStyle = '#c8c8c8';
  ctx.lineWidth = 2;
  roundRect(ctx, busX + 8, busY + 8, busW - 16, busH - 16, radius, false, true);

  // Frente do ônibus
  ctx.fillStyle = '#d0d0d0';
  ctx.beginPath();
  ctx.moveTo(busX + 20, busY + 35);
  ctx.quadraticCurveTo(busX - 10, busY + 70, busX + 10, busY + 130);
  ctx.lineTo(busX + 10, busY + 280);
  ctx.quadraticCurveTo(busX - 10, busY + 330, busX + 20, busY + 360);
  ctx.lineTo(busX + 30, busY + 360);
  ctx.lineTo(busX + 30, busY + 35);
  ctx.closePath();
  ctx.fill();

  // Volante
  ctx.strokeStyle = '#9e9e9e';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(busX + 40, busY + 250, 18, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(busX + 40, busY + 232);
  ctx.lineTo(busX + 40, busY + 268);
  ctx.moveTo(busX + 22, busY + 250);
  ctx.lineTo(busX + 58, busY + 250);
  ctx.stroke();

  // Layout dos assentos
  // 4 colunas visuais com corredor central
  // duas linhas superiores e duas inferiores
  const seatW = 48;
  const seatH = 42;
  const gapX = 12;
  const gapY = 10;

  const leftBlockX = busX + 75;
  const rightBlockX = busX + 250;
  const topRowY1 = busY + 45;
  const topRowY2 = busY + 97;
  const bottomRowY1 = busY + 195;
  const bottomRowY2 = busY + 247;

  // Organiza os assentos em ordem visual semelhante ao exemplo
  const positions = [];
  let n = 1;

  // Parte superior: 2 linhas
  for (let c = 0; c < 6 && n <= total; c++) {
    positions.push({ n: n++, x: leftBlockX + c * (seatW + gapX), y: topRowY1 });
  }
  for (let c = 0; c < 6 && n <= total; c++) {
    positions.push({ n: n++, x: leftBlockX + c * (seatW + gapX), y: topRowY2 });
  }

  // Parte direita superior
  for (let c = 0; c < 6 && n <= total; c++) {
    positions.push({ n: n++, x: rightBlockX + c * (seatW + gapX), y: topRowY1 });
  }
  for (let c = 0; c < 6 && n <= total; c++) {
    positions.push({ n: n++, x: rightBlockX + c * (seatW + gapX), y: topRowY2 });
  }

  // Parte inferior
  for (let c = 0; c < 6 && n <= total; c++) {
    positions.push({ n: n++, x: leftBlockX + c * (seatW + gapX), y: bottomRowY1 });
  }
  for (let c = 0; c < 6 && n <= total; c++) {
    positions.push({ n: n++, x: leftBlockX + c * (seatW + gapX), y: bottomRowY2 });
  }

  for (let c = 0; c < 6 && n <= total; c++) {
    positions.push({ n: n++, x: rightBlockX + c * (seatW + gapX), y: bottomRowY1 });
  }
  for (let c = 0; c < 6 && n <= total; c++) {
    positions.push({ n: n++, x: rightBlockX + c * (seatW + gapX), y: bottomRowY2 });
  }

  // Desenho dos assentos
  positions.forEach((seat) => {
    const isOcupado = ocupados.includes(seat.n);
    const isSelecionado = selecionado === seat.n;

    let fill = '#7CFC00'; // livre
    if (isOcupado) fill = '#d8d8d8';
    if (isSelecionado) fill = '#f3e98a';

    ctx.fillStyle = fill;
    ctx.strokeStyle = '#8f8f8f';
    ctx.lineWidth = 2;
    roundRect(ctx, seat.x, seat.y, seatW, seatH, 6, true, true);

    ctx.fillStyle = '#2d2d2d';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (isOcupado) {
      ctx.fillText('X', seat.x + seatW / 2, seat.y + seatH / 2);
    } else {
      ctx.fillText(String(seat.n), seat.x + seatW / 2, seat.y + seatH / 2);
    }
  });

  // Legenda
  const legendY = 525;
  drawLegend(ctx, 240, legendY, '#7CFC00', 'LIVRE');
  drawLegend(ctx, 420, legendY, '#f3e98a', 'SELECIONADO');
  drawLegend(ctx, 640, legendY, '#d8d8d8', 'OCUPADO');

  const buffer = canvas.toBuffer('image/png');
  const base64 = buffer.toString('base64');

  res.json({
    imagem_base64: base64
  });
});

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius };
  }

  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();

  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawLegend(ctx, x, y, color, label) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 24, 24);

  ctx.fillStyle = '#2f2f35';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 34, y + 12);
}

app.get('/', (req, res) => {
  res.send('API do mapa de assentos rodando.');
});

app.listen(10000, () => {
  console.log('Servidor rodando na porta 10000');
});
