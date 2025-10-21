const functions = require('@google-cloud/functions-framework');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

functions.cloudEvent('notifyOnUpload', (cloudEvent) => {
  
  const file = cloudEvent.data;
  const bucketName = file.bucket;
  const fileName = file.name;
  const contentType = file.contentType;

  console.log(`Novo arquivo detectado: ${fileName} no bucket ${bucketName}.`);

  const msg = {
    to: process.env.EMAIL_TO,       
    from: process.env.EMAIL_FROM,     
    subject: `[Notificação] Novo Upload no GCS: ${fileName}`,
    text: `
      Um novo arquivo foi enviado para o Google Cloud Storage.

      Detalhes:
      - Arquivo: ${fileName}
      - Bucket: ${bucketName}
      - Tipo: ${contentType}
    `,
    html: `
      <p>Um novo arquivo foi enviado para o Google Cloud Storage.</p>
      <p><strong>Detalhes:</strong></p>
      <ul>
        <li><strong>Arquivo:</strong> ${fileName}</li>
        <li><strong>Bucket:</strong> ${bucketName}</li>
        <li><strong>Tipo:</strong> ${contentType}</li>
      </ul>
    `,
  };

  return sgMail
    .send(msg)
    .then(() => {
      console.log(`E-mail de notificação enviado com sucesso para ${msg.to}.`);
    })
    .catch((error) => {
      console.error('Erro ao enviar e-mail via SendGrid:');
      console.error(JSON.stringify(error, null, 2));
    });
});