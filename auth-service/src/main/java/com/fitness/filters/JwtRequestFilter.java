package com.fitness.filters;

import com.fitness.service.AppUserDetailService;
import com.fitness.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {

    private final AppUserDetailService appUserDetailService;
    private final JwtUtil jwtUtil;

    // Make sure these paths match EXACTLY what's in your SecurityConfig
    private static final List<String> PUBLIC_URLS = Arrays.asList(
            "/login",
            "/register",
            "/send-reset-otp",
            "/reset-password",
            "/logout",
            "/validate-user/**"
    );

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();
        return PUBLIC_URLS.stream().anyMatch(path::endsWith);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String jwt = null;
        String email = null;
        final String authorizationHeader = request.getHeader("Authorization");

        if(authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
        }

        if(jwt == null) {
            Cookie[] cookies = request.getCookies();
            if(cookies != null) {
                for(Cookie cookie: cookies) {
                    if("jwt".equals(cookie.getName())) {
                        jwt = cookie.getValue();
                        break;
                    }
                }
            }
        }

        if(jwt != null) {
            email = jwtUtil.extractEmail(jwt);
            if(email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = appUserDetailService.loadUserByUsername(email);
                if(jwtUtil.validateTokens(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}