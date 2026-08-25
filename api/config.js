export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    publicConfig: {
      appName: 'Authority OS',
      version: '2.2.0',
      features: {
        aiStrategy: true,
        n8nGateway: true,
        localPersistence: true,
        databaseReady: Boolean(process.env.DATABASE_URL)
      }
    }
  });
}
