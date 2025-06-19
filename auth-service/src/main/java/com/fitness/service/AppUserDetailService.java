package com.fitness.service;

import com.fitness.model.User;
import com.fitness.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AppUserDetailService implements UserDetailsService {
   private final UserRepository userRepository;

   @Override
   public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
      User existingUser =  userRepository.findByEmail(email)
               .orElseThrow(()-> new UsernameNotFoundException("Email Not Found For: "+ email));
                System.out.println(email);
       return new org.springframework.security.core.userdetails.User(
               existingUser.getEmail(), existingUser.getPassword(), new ArrayList<>());
   }
}
