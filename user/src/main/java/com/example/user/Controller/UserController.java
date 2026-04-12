package com.example.user.Controller;

import com.example.user.Entity.User;
import com.example.user.Repository.UserRepository;
import com.example.user.dto.ProfilePatchDto;
import com.example.user.service.LocalUserFromJwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LocalUserFromJwtService localUserFromJwtService;

    public UserController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            LocalUserFromJwtService localUserFromJwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.localUserFromJwtService = localUserFromJwtService;
    }


    /**
     * Recherche d’utilisateurs (prénom, nom, email) réservée aux admins.
     * Si {@code q} est vide ou absent, renvoie toute la liste (même comportement que la collection REST).
     */
    @GetMapping("/admin/search")
    public List<User> adminSearchUsers(@RequestParam(name = "q", required = false) String q) {
        if (q == null || q.isBlank()) {
            return userRepository.findAll();
        }
        String term = q.trim();
        return userRepository.searchByKeyword(term);
    }

    @GetMapping("/me")
    public Map<String, Object> me(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        response.put("authenticated", authentication != null && authentication.isAuthenticated());
        response.put("name", authentication != null ? authentication.getName() : null);
        response.put("authorities", authentication != null ? authentication.getAuthorities() : List.of());

        if (authentication != null && authentication.getPrincipal() instanceof Jwt jwt) {
            response.put("preferred_username", jwt.getClaimAsString("preferred_username"));
            response.put("email", jwt.getClaimAsString("email"));
            response.put("sub", jwt.getSubject());
            try {
                User local = localUserFromJwtService.ensureLocalUserFromJwt(jwt);
                response.put("dbUserId", local.getId());
            } catch (IllegalArgumentException ex) {
                response.put("dbSyncError", ex.getMessage());
            }
        }

        return response;
    }

    /**
     * Mise à jour du profil de l’utilisateur connecté uniquement (email issu du JWT).
     * Les écritures sur la collection /users (Data REST) restent réservées au client_admin.
     */
    @PatchMapping("/me")
    public User patchMyProfile(Authentication authentication, @RequestBody ProfilePatchDto body) {
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        }
        User user;
        try {
            user = localUserFromJwtService.ensureLocalUserFromJwt(jwt);
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, ex.getMessage());
        }

        if (body.getFirstname() != null) {
            user.setFirstname(body.getFirstname());
        }
        if (body.getLastname() != null) {
            user.setLastname(body.getLastname());
        }
        if (body.getBirthday() != null) {
            user.setBirthday(body.getBirthday());
        }
        if (body.getPassword() != null && !body.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(body.getPassword()));
        }

        return userRepository.save(user);
    }
}
