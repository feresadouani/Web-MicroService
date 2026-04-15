package com.example.clubs.service;

import com.example.clubs.entity.Club;
import com.example.clubs.entity.Member;
import com.example.clubs.repository.ClubRepository;
import com.example.clubs.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRepository clubRepository;
    private final MemberRepository memberRepository;

    public List<Club> findAll() {
        return clubRepository.findAll();
    }

    public Optional<Club> findById(Long id) {
        return clubRepository.findById(id);
    }

    public Club save(Club club) {
        return clubRepository.save(club);
    }

    public void deleteById(Long id) {
        clubRepository.deleteById(id);
    }

    public List<Member> findMembersByClubId(Long clubId) {
        return clubRepository.findById(clubId)
                .map(Club::getMembers)
                .orElse(Collections.emptyList());
    }

    public Member addMemberToClub(Long clubId, Member member) {
        Club club = clubRepository.findById(clubId)
                .orElseThrow(() -> new IllegalArgumentException("Club not found: " + clubId));
        member.setClub(club);
        return memberRepository.save(member);
    }

    public void removeMemberFromClub(Long clubId, Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("Member not found: " + memberId));

        if (!member.getClub().getId().equals(clubId)) {
            throw new IllegalArgumentException("Member does not belong to club: " + clubId);
        }
        memberRepository.delete(member);
    }
}
