
# Notificador de Upload para GCS

Um projeto serverless simples que envia uma notificação por e-mail (via SendGrid) sempre que um arquivo é enviado para um bucket do Google Cloud Storage.

O fluxo de arquitetura é o seguinte:

1.  Uma Cloud Function HTTP (`api-upload-url`) gera uma Signed URL v4.
2.  Um cliente (frontend) usa essa URL para fazer o upload de um arquivo diretamente para o GCS.
3.  O evento de criação do arquivo no GCS aciona uma segunda Cloud Function (`api-notify-email`).
4.  A função `api-notify-email` usa a API do SendGrid para enviar um e-mail de notificação.

-----

## Pré-requisitos

  * Uma conta do Google Cloud com faturamento ativado.
  * Uma conta [SendGrid](https://sendgrid.com/) (para o envio de e-mails) com uma API Key e um E-mail Verificado.
  * [Node.js](https://nodejs.org/en) (versão 20 ou superior).
  * O [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) instalado.

-----

## Configuração e Deploy

Siga estes passos no seu terminal para configurar e fazer o deploy do projeto.

### 1\. Criar o Bucket no GCS

Primeiro, crie o bucket que armazenará os arquivos. Substitua `[NOME-DO-BUCKET]` por um nome único global.

*Se você instalou o CLI em um local específico e não o adicionou ao seu PATH:*

```bash
# Executar no terminal onde foi extraída a pasta do cli
./bin/gsutil mb -l us-central1 gs://[NOME-DO-BUCKET]
```

*Se você instalou o CLI e o adicionou ao seu PATH (mais comum):*

```bash
gsutil mb -l us-central1 gs://[NOME-DO-BUCKET]
```

### 2\. Deploy da API de Geração de URL (`getUploadUrl`)

Esta função HTTP irá gerar a URL assinada para o upload.

```bash
# 1. Navegue até a pasta da função
cd api-upload-url

# 2. Instale as dependências
npm install

# 3. Faça o deploy da função
gcloud functions deploy getUploadUrl \
  --gen2 \
  --runtime nodejs20 \
  --region us-central1 \
  --source . \
  --entry-point getUploadUrl \
  --trigger-http \
  --allow-unauthenticated
```

### 3\. Deploy da Função de Notificação (`notifyOnUpload`)

Esta função será acionada pelo GCS e enviará o e-mail.

**Importante:** Substitua `[NOME-DO-BUCKET]`, `[SUA_CHAVE_SENDGRID]`, `[SEU_EMAIL_DESTINO]` e `[SEU_EMAIL_VERIFICADO]` pelos seus valores reais.

```bash
# 1. Navegue até a pasta da função
cd api-notify-email

# 2. Instale as dependências
npm install

# 3. Faça o deploy da função
gcloud functions deploy notifyOnUpload \
  --gen2 \
  --runtime nodejs20 \
  --region us-central1 \
  --source . \
  --entry-point notifyOnUpload \
  --trigger-event-filters="type=google.cloud.storage.object.v1.finalized" \
  --trigger-event-filters="bucket=[NOME-DO-BUCKET]" \
  --set-env-vars="SENDGRID_API_KEY=[SUA_CHAVE_SENDGRID],EMAIL_TO=[SEU_EMAIL_DESTINO],EMAIL_FROM=[SEU_EMAIL_VERIFICADO]"
```

-----

## Solução de Problemas (Troubleshooting)

### Erro de CORS no Upload

Se o seu frontend (ex: `index.html`) falhar ao fazer o upload (`PUT`) para o GCS, provavelmente é um problema de CORS no bucket. O bucket precisa de permissão para aceitar requisições `PUT` de outras origens (como o seu `localhost` ou `file://`).

**1. Crie um arquivo `cors-config.json`:**

```bash
nano cors-config.json
```

**2. Cole o seguinte conteúdo no arquivo:**

```json
[
  {
    "origin": ["*"],
    "method": ["PUT", "OPTIONS"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

**3. Salve o arquivo e aplique a configuração ao seu bucket:**
(Lembre-se de substituir `[NOME-DO-BUCKET]`)

```bash
gsutil cors set cors-config.json gs://[NOME-DO-BUCKET]
```

### Erros de Permissão (IAM)

Se a API `getUploadUrl` falhar (ex: erro 500, `Failed to fetch` ou `signBlob denied`), certifique-se de que o Service Account da função tem as seguintes permissões:

1.  `roles/iam.serviceAccountTokenCreator` (Permissão no **Projeto**)
2.  `roles/storage.objectAdmin` (Permissão no **Bucket**)

-----

-----

# GCS Upload Notifier (English)

A simple serverless project that sends an email notification (via SendGrid) whenever a file is uploaded to a Google Cloud Storage bucket.

The architecture flow is as follows:

1.  An HTTP Cloud Function (`api-upload-url`) generates a v4 Signed URL.
2.  A client (frontend) uses this URL to upload a file directly to GCS.
3.  The file creation event in GCS triggers a second Cloud Function (`api-notify-email`).
4.  The `api-notify-email` function uses the SendGrid API to send an email notification.

-----

## Prerequisites

  * A Google Cloud account with billing enabled.
  * A [SendGrid](https://sendgrid.com/) account (for sending emails) with an API Key and a Verified Sender Email.
  * [Node.js](https://nodejs.org/en) (version 20 or higher).
  * The [Google Cloud CLI](https://cloud.google.com/sdk/docs/install) installed.

-----

## Setup and Deployment

Follow these steps in your terminal to set up and deploy the project.

### 1\. Create the GCS Bucket

First, create the bucket that will store the files. Replace `[YOUR-BUCKET-NAME]` with a globally unique name.

*If you installed the CLI in a specific directory and did not add it to your PATH:*

```bash
# Run this in the terminal where the CLI folder was extracted
./bin/gsutil mb -l us-central1 gs://[YOUR-BUCKET-NAME]
```

*If you installed the CLI and added it to your PATH (most common):*

```bash
gsutil mb -l us-central1 gs://[YOUR-BUCKET-NAME]
```

### 2\. Deploy the URL Generator API (`getUploadUrl`)

This HTTP function will generate the signed URL for the upload.

```bash
# 1. Navigate to the function's folder
cd api-upload-url

# 2. Install dependencies
npm install

# 3. Deploy the function
gcloud functions deploy getUploadUrl \
  --gen2 \
  --runtime nodejs20 \
  --region us-central1 \
  --source . \
  --entry-point getUploadUrl \
  --trigger-http \
  --allow-unauthenticated
```

### 3\. Deploy the Notification Function (`notifyOnUpload`)

This function will be triggered by GCS and will send the email.

**Important:** Replace `[YOUR-BUCKET-NAME]`, `[YOUR_SENDGRID_KEY]`, `[YOUR_DESTINATION_EMAIL]`, and `[YOUR_VERIFIED_EMAIL]` with your actual values.

```bash
# 1. Navigate to the function's folder
cd api-notify-email

# 2. Install dependencies
npm install

# 3. Deploy the function
gcloud functions deploy notifyOnUpload \
  --gen2 \
  --runtime nodejs20 \
  --region us-central1 \
  --source . \
  --entry-point notifyOnUpload \
  --trigger-event-filters="type=google.cloud.storage.object.v1.finalized" \
  --trigger-event-filters="bucket=[YOUR-BUCKET-NAME]" \
  --set-env-vars="SENDGRID_API_KEY=[YOUR_SENDGRID_KEY],EMAIL_TO=[YOUR_DESTINATION_EMAIL],EMAIL_FROM=[YOUR_VERIFIED_EMAIL]"
```

-----

## Troubleshooting

### CORS Error on Upload

If your frontend (e.g., `index.html`) fails when uploading the file (`PUT`) to GCS, it is likely a CORS problem on the bucket. The bucket needs permission to accept `PUT` requests from other origins (like your `localhost` or `file://`).

**1. Create a `cors-config.json` file:**

```bash
nano cors-config.json
```

**2. Paste the following content into the file:**

```json
[
  {
    "origin": ["*"],
    "method": ["PUT", "OPTIONS"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

**3. Save the file and apply the configuration to your bucket:**
(Remember to replace `[YOUR-BUCKET-NAME]`)

```bash
gsutil cors set cors-config.json gs://[YOUR-BUCKET-NAME]
```

### Permission Errors (IAM)

If the `getUploadUrl` API fails (e.g., 500 error, `Failed to fetch`, or `signBlob denied`), ensure the function's Service Account has the following roles:

1.  `roles/iam.serviceAccountTokenCreator` (Permission on the **Project**)
2.  `roles/storage.objectAdmin` (Permission on the **Bucket**)
