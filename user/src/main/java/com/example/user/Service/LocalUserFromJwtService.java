package com.example.user.Service;

import com.example.user.Entity.User;
import com.example.user.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.UUID;


@Service
@RequiredArgsConstructor
public class LocalUserFromJwtService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User ensureLocalUserFromJwt(Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        if (email == null || email.isBlank()) {
            email = jwt.getClaimAsString("preferred_username");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("An error occurred while loading your account.");
        }
        String key = email.trim();
        return userRepository.findByEmail(key).orElseGet(() -> {
            User u = new User();
            u.setEmail(key);
            u.setFirstname(firstNameFrom(jwt));
            u.setLastname(lastNameFrom(jwt));
            u.setRole("USER");
            u.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            return userRepository.save(u);
        });
    }

    private static String firstNameFrom(Jwt jwt) {
        String g = jwt.getClaimAsString("given_name");
        if (g != null && !g.isBlank()) {
            return g;
        }
        return namePart(jwt.getClaimAsString("name"), 0);
    }

    private static String lastNameFrom(Jwt jwt) {
        String f = jwt.getClaimAsString("family_name");
        if (f != null && !f.isBlank()) {
            return f;
        }
        return namePart(jwt.getClaimAsString("name"), 1);
    }

    private static String namePart(String full, int index) {
        if (full == null || full.isBlank()) {
            return "";
        }
        String[] p = full.trim().split("\\s+", 2);
        if (p.length == 0) {
            return "";
        }
        if (index == 0) {
            return p[0];
        }
        return p.length > 1 ? p[1] : "";
    }
}
