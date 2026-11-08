const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const P = require('pino');

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({ auth: state, logger: P({ level: 'silent' }), printQRInTerminal: true });
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, qr } = update;
        if (qr) { qrcode.generate(qr, { small: true }); }
        if (connection === 'close') { startBot(); }
        if (connection === 'open') { console.log('ASH Bot Connected!'); }
    });
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
        const from = msg.key.remoteJid;
        const lower = text.toLowerCase();
        if (lower === 'hi') { await sock.sendMessage(from, { text: 'Hi! Mama ASH Bot! menu kiyala ewanna' }); }
        else if (lower === 'menu') { await sock.sendMessage(from, { text: 'MENU:\n1. hi\n2. time\n3. song + name\n4. owner' }); }
        else if (lower === 'time') { await sock.sendMessage(from, { text: 'Time: ' + new Date().toLocaleString() }); }
        else if (lower.startsWith('song')) { let s = text.slice(4).trim(); await sock.sendMessage(from, { text: 'Song: ' + s + '\nhttps://www.youtube.com/results?search_query=' + encodeURIComponent(s) }); }
        else if (lower === 'owner') { await sock.sendMessage(from, { text: 'Owner: ASH - Sri Lanka' }); }
    });
}
startBot();
