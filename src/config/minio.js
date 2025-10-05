import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: false,
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
});

export default minioClient;
