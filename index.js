const { default: makeWASocket, useMultiFileAuthState, makeInMemoryStore, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let sock;
let store;

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth_info");

  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    printQRInTerminal: false,
    auth: state,
    syncFullHistory: true
  });

  store = makeInMemoryStore({});
  store.bind(sock.ev);

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect, qr, pairingCode } = update;

    if (pairingCode) {
      console.log("Pair Code:", pairingCode);
    }

    if (connection === "open") {
      console.log("✅ Connected");
    }
  });

  return sock;
}

app.post("/send-broadcast", async (req, res) => {
  const { message, groupJid } = req.body;

  try {
    const groupMetadata = await sock.groupMetadata(groupJid);
    const participants = groupMetadata.participants;

    for (const participant of participants) {
      const jid = participant.id;
      await sock.sendMessage(jid, { text: message });
    }

    res.json({ success: true, sent: participants.length });
  } catch (error) {
    console.error("Broadcast Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/generate-pair-code/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;
    if (!sock) {
      await connectToWhatsApp();
    }

    const code = await sock.requestPairingCode(phone);
    res.json({ pairCode: code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
