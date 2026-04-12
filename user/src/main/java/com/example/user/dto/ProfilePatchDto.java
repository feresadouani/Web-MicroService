package com.example.user.dto;

import lombok.Data;

import java.util.Date;

/** Champs modifiables par l'utilisateur connecté sur son propre profil (PATCH /users/me). */
@Data
public class ProfilePatchDto {
    private String firstname;
    private String lastname;
    private Date birthday;
    /** Optionnel ; si renseigné, remplace le mot de passe (hash BCrypt). */
    private String password;
}
