package com.fitness.gateway_service.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtils {
    @Value("${jwt.secret.key}")
    private String SECRET_KEY;

    public Claims extractAllClaims(String token){
        return Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isTokenValid(String token){
        try{
            Claims claims = extractAllClaims(token);
            return !claims.getExpiration().before(new Date());
        }catch (Exception e){
            return false;
        }
    }

    public String extractEmail(String token){
        return extractAllClaims(token).getSubject();
    }
}
