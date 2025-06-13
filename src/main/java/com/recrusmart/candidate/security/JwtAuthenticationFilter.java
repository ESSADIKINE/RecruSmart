import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Value("${jwt.secret}")
    private String jwtSecret;

    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");
        logger.info("[JWT] Requête {} {} - Authorization header: {}", request.getMethod(), request.getRequestURI(), header);
        if (header == null || !header.startsWith("Bearer ")) {
            logger.warn("[JWT] Authorization header missing or does not start with Bearer");
        } else {
            String token = header.substring(7);
            try {
                Claims claims = Jwts.parser()
                        .setSigningKey(jwtSecret.getBytes())
                        .parseClaimsJws(token)
                        .getBody();

                String username = claims.getSubject();
                if (username != null) {
                    logger.info("[JWT] JWT valid for user: {}", username);
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            username, null, Collections.emptyList());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    logger.warn("[JWT] JWT valid but subject (username) is null");
                }
            } catch (io.jsonwebtoken.ExpiredJwtException e) {
                logger.error("[JWT] JWT expired: {}", e.getMessage());
            } catch (io.jsonwebtoken.SignatureException e) {
                logger.error("[JWT] JWT signature invalid: {}", e.getMessage());
            } catch (Exception e) {
                logger.error("[JWT] JWT invalid: {}", e.getMessage());
            }
        }
        filterChain.doFilter(request, response);
        logger.info("[JWT] Fin du filtre - Statut réponse: {}", response.getStatus());
    }
} 