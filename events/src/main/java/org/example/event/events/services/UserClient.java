package org.example.event.events.services;

import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(name = "client-s", url ="http://localhost:8082")
public interface UserClient {

    
}
