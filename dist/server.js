require('dotenv').config();

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { Pool } = require('pg');

const PORT = process.env.PORT || 3000;
const DATABASE_URL = process.env.DATABASE_URL;

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
