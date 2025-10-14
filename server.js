require('dotenv').config();

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!API_KEY || API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('❌ ERROR: ANTHROPIC_API_KEY no está configurada');
    console.error('Por favor crea un archivo .env con tu API key de Anthropic');
    console.error('Ejemplo: ANTHROPIC_API_KEY=tu_api_key_aqui');
    process.exit(1);
}

if (!DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está configurada');
    console.error('Por favor configura DATABASE_URL en el archivo .env');
    console.error('Ejemplo: DATABASE_URL=postgresql://postgres:PASSWORD@db.rhzfstnkavzqvcymavua.supabase.co:5432/postgres');
    process.exit(1);
}

// Configurar PostgreSQL (SIEMPRE usar base de datos)
const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

console.log('✅ Usando PostgreSQL para almacenamiento');

// Inicializar tabla
initDatabase();

// Inicializar base de datos
async function initDatabase() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS app_data (
                id INTEGER PRIMARY KEY DEFAULT 1,
                data JSONB NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT single_row CHECK (id = 1)
            );
        `);

        // Verificar si existe la fila, si no crearla
        const result = await pool.query('SELECT * FROM app_data WHERE id = 1');
        if (result.rows.length === 0) {
            await pool.query(
                'INSERT INTO app_data (id, data) VALUES (1, $1)',
                [JSON.stringify({ notes: [], history: [] })]
            );
            console.log('✅ Tabla app_data inicializada');
        } else {
            console.log('✅ Base de datos lista');
        }
    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error);
    }
}

// Cargar notas
async function loadNotes() {
    try {
        const result = await pool.query('SELECT data FROM app_data WHERE id = 1');
        if (result.rows.length > 0) {
            return result.rows[0].data;
        }
        return { notes: [], history: [] };
    } catch (error) {
        console.error('❌ Error cargando de PostgreSQL:', error);
        throw error;
    }
}

// Guardar notas
async function saveNotes(data) {
    try {
        await pool.query(
            'UPDATE app_data SET data = $1, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
            [JSON.stringify(data)]
        );
        console.log('✅ Notas guardadas en PostgreSQL:', data.notes.length, 'notas');
    } catch (error) {
        console.error('❌ Error guardando en PostgreSQL:', error);
        throw error;
    }
}

const server = http.createServer(async (req, res) => {
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
            const data = await loadNotes();
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify(data));
        } catch (error) {
            console.error('❌ Error cargando notas:', error);
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

        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                await saveNotes(data);
                res.writeHead(200, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ success: true }));
            } catch (error) {
                console.error('❌ Error guardando notas:', error);
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
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;

    if (pathname === '/' || pathname === '/index.html') {
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
