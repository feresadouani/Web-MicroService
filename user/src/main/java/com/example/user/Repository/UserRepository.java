package com.example.user.Repository;

import com.example.user.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
@RepositoryRestResource(path = "users", collectionResourceRel = "users")
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @Query(
            "SELECT u FROM User u WHERE "
                    + "LOWER(u.firstname) LIKE LOWER(CONCAT('%', :q, '%')) OR "
                    + "LOWER(u.lastname) LIKE LOWER(CONCAT('%', :q, '%')) OR "
                    + "LOWER(u.email) LIKE LOWER(CONCAT('%', :q, '%'))")
    List<User> searchByKeyword(@Param("q") String q);
}
