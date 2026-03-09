package com.kv.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class SecurityConfig {

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
	    http
	        .csrf(csrf -> csrf.disable()) // disable CSRF for REST
	        .authorizeHttpRequests(auth -> auth
	            .anyRequest().permitAll() // allow all requests
	        );
	    return http.build();
	}
	
	@Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("QuickRide - Uber Clone Backend")
                        .version("1.0")
                        .description("Ride booking system with nearest driver matching"));
    }
}
