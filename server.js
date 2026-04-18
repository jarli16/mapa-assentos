const express = require('express');
const { createCanvas } = require('canvas');

const app = express();
app.use(express.json({ limit: '10mb' }));

app.post('/mapa-assentos', (req, res) => {
  const ocupados = Array.isArray(req.body.ocupados)
    ? req.body.ocupados.map(Number)
    : [];

  const selecionado = req.body.selecionado ? Number(req.body.selecionado) : null;

  const width = 900;
  const height = 700;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Fundo
  ctx.fillStyle = '#ececec';
  ctx.fillRect(0, 0, width, height);

  // Título
  ctx.fillStyle = '#2f2f35';
  ctx.font = 'bold 42px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('MAPA DE ASSENTOS', width / 2, 70);

  // Corpo do ônibus
  const busX = 120;
  const busY = 120;
  const busW = 650;
  const busH = 360;
  const radius = 28;

  ctx.fillStyle = '#d9d9d9';
  roundRect(ctx, busX, busY, busW, busH, radius, true, false);

  ctx.fillStyle = '#f5f5f5';
  roundRect(ctx, busX + 8, busY + 8, busW - 16, busH - 16, radius, true, false);

  ctx.strokeStyle = '#c8c8c8';
  ctx.lineWidth = 2;
  roundRect(ctx, busX + 8, busY + 8, busW - 16, busH - 16, radius, false, true);

  // Frente do ônibus
  ctx.fillStyle = '#cfcfcf';
  ctx.beginPath();
  ctx.moveTo(busX + 15, busY + 35);
  ctx.quadraticCurveTo(busX - 5, busY + 70, busX + 10, busY + 125);
  ctx.lineTo(busX + 10, busY + 280);
  ctx.quadraticCurveTo(busX - 5, busY + 330, busX + 15, busY + 365);
  ctx.lineTo(busX + 28, busY + 365);
  ctx.lineTo(busX + 28, busY + 35);
  ctx.closePath();
  ctx.fill();

  // Volante
  ctx.strokeStyle = '#999999';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(busX + 40, busY + 255, 18, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(busX + 40, busY + 237);
  ctx.lineTo(busX + 40, busY + 273);
  ctx.moveTo(busX + 22, busY + 255);
  ctx.lineTo(busX + 58, busY + 255);
  ctx.stroke();

  // Mapeamento real dos assentos
  const seatW = 58;
  const seatH = 42;
  const leftX1 = busX + 75;
  const leftX2 = busX + 145;

  const corridorX = busX + 245;

  const rightX1 = busX + 320;
  const rightX2 = busX + 390;

  const row1Y = busY + 45;
  const rowGap = 56;

  const positions = {
    1:  { x: leftX1, y: row1Y },
    2:  { x: leftX2, y: row1Y },

    3:  { x: leftX1, y: row1Y + rowGap * 1 },
    4:  { x: leftX2, y: row1Y + rowGap * 1 },
    5:  { x: rightX1, y: row1Y + rowGap * 1 },
    6:  { x: rightX2, y: row1Y + rowGap * 1 },

    7:  { x: leftX1, y: row1Y + rowGap * 2 },
    8:  { x: leftX2, y: row1Y + rowGap * 2 },
    9:  { x: rightX1, y: row1Y + rowGap * 2 },
    10: { x: rightX2, y: row1Y + rowGap * 2 },

    11: { x: leftX1, y: row1Y + rowGap * 3 },
    12: { x: leftX2, y: row1Y + rowGap * 3 },
    13: { x: rightX1, y: row1Y + rowGap * 3 },
    14: { x: rightX2, y: row1Y + rowGap * 3 },

    15: { x: leftX1, y: row1Y + rowGap * 4 },
    16: { x: leftX2, y: row1Y + rowGap * 4 },
    17: { x: rightX1, y: row1Y + rowGap * 4 },
    18: { x: rightX2, y: row1Y + rowGap * 4 },

    19: { x: leftX1, y: row1Y + rowGap * 5 },
    20: { x: leftX2, y: row1Y + rowGap * 5 },
    21: { x: rightX1, y: row1Y + rowGap * 5 },
    22: { x: rightX2, y: row1Y + rowGap * 5 },

    23: { x: leftX1, y: row1Y + rowGap * 6 },
    24: { x: leftX2, y: row1Y + rowGap * 6 },
    25: { x: rightX1, y: row1Y + rowGap * 6 },
    26: { x: rightX2, y: row1Y + rowGap * 6 },

    27: { x: leftX1, y: row1Y + rowGap * 7 },
    28: { x: leftX2, y: row1Y + rowGap * 7 },
    31: { x: corridorX, y: row1Y + rowGap * 7 },
    29: { x: rightX1, y: row1Y + rowGap * 7 },
    30: { x: rightX2, y: row1Y + rowGap * 7 },
  };

  // Entrada
  ctx.fillStyle = '#d9d9d9';
  ctx.fillRect(corridorX - 10, row1Y - 5, 70, 48);
  ctx.fillStyle = '#d71919';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Entrada', corridorX + 25, row1Y + 18);

  // Corredor
  ctx.fillStyle = '#e2e2e2';
  ctx.fillRect(corridorX - 5, row1Y + rowGap, 60, rowGap * 6 + seatH + 14);

  // Desenha assentos
  Object.entries(positions).forEach(([num, pos]) => {
    const seatNum = Number(num);
    const isOcupado = ocupados.includes(seatNum);
    const isSelecionado = selecionado === seatNum;

    let fillColor = '#7CFC00'; // livre
    let textColor = '#111111';
    let textValue = String(seatNum).padStart(2, '0');

    if (isOcupado) {
      fillColor = '#d9d9d9';
      textColor = '#7c7c7c';
      textValue = 'X';
    }

    if (isSelecionado) {
      fillColor = '#f3e98a';
      textColor = '#111111';
      textValue = String(seatNum).padStart(2, '0');
    }

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = '#707070';
    ctx.lineWidth = 1.5;
    roundRect(ctx, pos.x, pos.y, seatW, seatH, 6, true, true);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textValue, pos.x + seatW / 2, pos.y + seatH / 2);
  });

  // Legenda
  const legendY = 585;
  drawLegend(ctx, 240, legendY, '#7CFC00', 'LIVRE');
  drawLegend(ctx, 420, legendY, '#f3e98a', 'SELECIONADO');
  drawLegend(ctx, 640, legendY, '#d9d9d9', 'OCUPADO');

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
