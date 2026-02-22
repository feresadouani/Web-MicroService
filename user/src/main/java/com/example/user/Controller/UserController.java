package com.example.user.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/users")
public class UserController {
    @GetMapping("test")
    public String test(){
        return "test";
    }
    @GetMapping("test2")
    public String test2(){
        return "test";
    }
}
