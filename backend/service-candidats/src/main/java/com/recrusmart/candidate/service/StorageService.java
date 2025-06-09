package com.recrusmart.candidate.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class StorageService {
    private final MinioClient minioClient;

    @Value("${minio.bucket.name}")
    private String bucketName;

    public StorageService(MinioClient minioClient) {
        this.minioClient = minioClient;
    }

    public String uploadCvFile(String path, MultipartFile file) {
        try {
            InputStream inputStream = file.getInputStream();
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(path)
                    .stream(inputStream, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build()
            );
            return String.format("http://minio:9000/%s/%s", bucketName, path);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload CV to MinIO: " + e.getMessage());
        }
    }
}
