export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: 'authority-os-api',
    version: '2.1.0',
    time: new Date().toISOString()
  });
}
