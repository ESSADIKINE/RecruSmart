package com.recrusmart.candidate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ServiceCandidatsApplication {

	public static void main(String[] args) {
		SpringApplication.run(ServiceCandidatsApplication.class, args);
	}

}
