package com.example.clubs.controller;

import com.example.clubs.entity.Club;
import com.example.clubs.entity.Member;
import com.example.clubs.service.ClubService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
@RequiredArgsConstructor
public class ClubController {

    private final ClubService clubService;

    @GetMapping
    public ResponseEntity<List<Club>> getAllClubs() {
        List<Club> clubs = clubService.findAll();
        return ResponseEntity.ok(clubs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Club> getClubById(@PathVariable Long id) {
        return clubService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{clubId}/members")
    public ResponseEntity<List<Member>> getMembersByClubId(@PathVariable Long clubId) {
        if (!clubService.findById(clubId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(clubService.findMembersByClubId(clubId));
    }

    @PostMapping("/{clubId}/members")
    public ResponseEntity<Member> addMemberToClub(@PathVariable Long clubId, @RequestBody Member member) {
        if (!clubService.findById(clubId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Member savedMember = clubService.addMemberToClub(clubId, member);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedMember);
    }

    @DeleteMapping("/{clubId}/members/{memberId}")
    public ResponseEntity<Void> removeMemberFromClub(@PathVariable Long clubId, @PathVariable Long memberId) {
        if (!clubService.findById(clubId).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        clubService.removeMemberFromClub(clubId, memberId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<Club> createClub(@RequestBody Club club) {
        Club savedClub = clubService.save(club);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedClub);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Club> updateClub(@PathVariable Long id, @RequestBody Club club) {
        if (!clubService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        club.setId(id);
        Club updatedClub = clubService.save(club);
        return ResponseEntity.ok(updatedClub);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClub(@PathVariable Long id) {
        if (!clubService.findById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }
        clubService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}