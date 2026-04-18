const express = require('express');
const { createCanvas } = require('canvas');

const app = express();
app.use(express.json());

app.post('/mapa-assentos', (req, res) => {
    const ocupados = req.body.ocupados || [];
    const total = req.body.total_assentos || 31;

    const canvas = createCanvas(500, 700);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 500, 700);

    ctx.font = '14px Arial';

    let x = 60;
    let y = 60;

    for (let i = 1; i <= total; i++) {
        if (ocupados.includes(i)) {
            ctx.fillStyle = '#555555';
        } else {
            ctx.fillStyle = '#ffffff';
        }

        ctx.strokeStyle = '#000000';
        ctx.fillRect(x, y, 40, 40);
        ctx.strokeRect(x, y, 40, 40);

        ctx.fillStyle = '#000000';
        ctx.fillText(i.toString(), x + 10, y + 25);

        y += 60;

        if (i % 4 === 0) {
            y = 60;
            x += 80;
        }
    }

    const buffer = canvas.toBuffer('image/png');
    const base64 = buffer.toString('base64');

    res.json({
    imagem_base64: base64
    });
});

app.listen(10000, () => console.log('Rodando na porta 10000'));
