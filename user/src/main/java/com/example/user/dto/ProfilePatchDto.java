package com.example.user.dto;

import lombok.Data;

import java.util.Date;


@Data
public class ProfilePatchDto {
    private String firstname;
    private String lastname;
    private Date birthday;
    private String password;
}
