
const express = require("express");
const crypto = require("crypto");

const app = express();
app.use(express.json());

const ADMIN_ID = "8072083995";

function verifyTelegram(initData) {
  if (!initData || !process.env.BOT_TOKEN) return null;

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(process.env.BOT_TOKEN)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secret)
    .update(dataCheckString)
    .digest("hex");

  if (!crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(calculatedHash, "hex")
  )) return null;

  const authDate = Number(params.get("auth_date"));
  if (!authDate || Date.now() / 1000 - authDate > 3600) return null;

  try {
    return JSON.parse(params.get("user") || "{}");
  } catch {
    return null;
  }
}

app.post("/api/admin/check", (req, res) => {
  const user = verifyTelegram(req.body.initData);

  if (!user || String(user.id) !== ADMIN_ID) {
    return res.status(403).json({ ok: false });
  }

  res.json({ ok: true, role: "admin" });
});

app.get("/", (req, res) => {
  res.send("Best Drop server is running!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Best Drop server started on port ${PORT}`);
});
