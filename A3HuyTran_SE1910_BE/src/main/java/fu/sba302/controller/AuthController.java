package fu.sba302.controller;

import fu.sba302.dto.CustomerDTO;
import fu.sba302.dto.LoginRequest;
import fu.sba302.dto.LoginResponse;
import fu.sba302.dto.RegisterRequest;
import fu.sba302.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * @author HuyTran - SE1910
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<CustomerDTO> register(@Valid @RequestBody RegisterRequest request) {
        CustomerDTO customerDTO = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(customerDTO);
    }
}

