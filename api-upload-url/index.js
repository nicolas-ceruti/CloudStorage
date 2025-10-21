const functions = require('@google-cloud/functions-framework');
const { Storage } = require('@google-cloud/storage');
const cors = require('cors')({ origin: true });

const storage = new Storage();
const BUCKET_NAME = 'bucket-test-sistemas-distribuidos'; 

functions.http('getUploadUrl', (req, res) => {
  cors(req, res, async () => {

    if (req.method !== 'POST') {
      return res.status(405).send('Metodo nao permitido (use POST)');
    }

    try {
      const { fileName, contentType } = req.body;
      if (!fileName || !contentType) {
        return res.status(400).send('Faltando fileName ou contentType no body');
      }

      const filePath = `uploads/${fileName}`;

      const options = {
        version: 'v4',
        action: 'write', 
        expires: Date.now() + 15 * 60 * 1000,
        contentType: contentType, 
      };

      const file = storage.bucket(BUCKET_NAME).file(filePath);

      const [signedUrl] = await file.getSignedUrl(options);
      
      res.status(200).json({ signedUrl: signedUrl });

    } catch (error) {
      console.error('Erro ao gerar Signed URL:', error.message);
      res.status(500).send('Erro interno ao gerar URL.');
    }
  });
});


