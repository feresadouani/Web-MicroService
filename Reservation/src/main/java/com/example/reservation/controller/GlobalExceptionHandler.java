package com.example.reservation.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAllExceptions(Exception ex) {
        ex.printStackTrace(); // Ensures it prints on the backend console
        return new ResponseEntity<>("Internal Error Details: " + ex.getMessage() + " | Cause: " + 
            (ex.getCause() != null ? ex.getCause().getMessage() : "None"), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
