package com.healthLink.Notification_Backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class HealthLinkNotificationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(HealthLinkNotificationServiceApplication.class, args);
	}

}
