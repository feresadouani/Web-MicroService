package com.example.clubs.service;

import com.example.clubs.entity.Club;
import com.example.clubs.repository.ClubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClubService {

    private final ClubRepository clubRepository;

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
}