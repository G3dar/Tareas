require('dotenv').config();

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const NOTES_FILE = path.join(__dirname, 'notes.json');

if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ ERROR: ANTHROPIC_API_KEY no está configurada');
    console.error('Por favor crea un archivo .env con tu API key de Anthropic');
    console.error('Ejemplo: ANTHROPIC_API_KEY=tu_api_key_aqui');
    process.exit(1);
}

// Inicializar archivo de notas si no existe
if (!fs.existsSync(NOTES_FILE)) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify({ notes: [], history: [] }, null, 2));
    console.log('✅ Archivo notes.json creado');
}

const server = http.createServer((req, res) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // Cargar notas
    if (req.url === '/api/notes' && req.method === 'GET') {
        try {
            const data = fs.readFileSync(NOTES_FILE, 'utf8');
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(data);
        } catch (error) {
            console.error('❌ Error leyendo notes.json:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Error loading notes' }));
        }
        return;
    }

    // Guardar notas
    if (req.url === '/api/notes' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                fs.writeFileSync(NOTES_FILE, JSON.stringify(data, null, 2));
                console.log('✅ Notas guardadas:', data.notes.length, 'notas');
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                console.error('❌ Error guardando notes.json:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Error saving notes' }));
            }
        });
        return;
    }

    // Proxy para API de Anthropic
    if (req.url === '/api/categorize' && req.method === 'POST') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const { text } = JSON.parse(body);

                const requestData = JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 500,
                    messages: [{
                        role: 'user',
                        content: `Analiza esta nota sobre el juego Eggscape y categorizala. Responde ÚNICAMENTE con un JSON válido, sin texto adicional:

{"category": "Bug|Feature|Performance|UI|Sound|Gameplay|Backend|Tools|Other", "tags": ["TAG1", "TAG2"]}

Tags disponibles para usar: PIECES, ENEMIGOS, UI, WEAPONS, LEVELS, LOBBY, TUTORIAL, COMBAT, VOICECHAT, PERFORMANCE, CAMERA, RACE MODE, GREEDY PIGGY, FUNCTIONALITY, MODO EDIT, PAUSA, LAYERS, PACKS, SHD, COLLECTABLES, COLLIDER, POLLERA, LOOK, MENU WB, ROY, SOUND, HONOR, RANK, GRID, BACKEND, PLAY, FRENZY, MARKET, GRABBABLES, MATCHMAKING, VR MODE, SNAPPING, FRIENDING, AUTOSAVE, VEHICLES, POWERUPS, LOGS, COSMETICS, BUILDER, TOOLS

Nota del usuario: "${text}"

Responde SOLO con el JSON, nada más.`
                    }]
                });

                const options = {
                    hostname: 'api.anthropic.com',
                    path: '/v1/messages',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': API_KEY,
                        'anthropic-version': '2023-06-01',
                        'Content-Length': Buffer.byteLength(requestData)
                    }
                };

                const apiReq = https.request(options, (apiRes) => {
                    let responseData = '';

                    apiRes.on('data', chunk => {
                        responseData += chunk;
                    });

                    apiRes.on('end', () => {
                        console.log('✅ API Response:', responseData);
                        res.writeHead(apiRes.statusCode, {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        });
                        res.end(responseData);
                    });
                });

                apiReq.on('error', (error) => {
                    console.error('❌ API Error:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message }));
                });

                apiReq.write(requestData);
                apiReq.end();

            } catch (error) {
                console.error('❌ Parse Error:', error);
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid request' }));
            }
        });
        return;
    }

    // Servir el archivo HTML principal
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Error loading index.html');
                return;
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`\n🥚 Eggscape Build Notes server running!`);
    console.log(`\n📍 Open in your browser: http://localhost:${PORT}`);
    console.log(`\n✨ Press Ctrl+C to stop the server\n`);
});
