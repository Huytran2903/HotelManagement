package fu.sba302.controller;

import fu.sba302.dto.ProfileDTO;
import fu.sba302.dto.ProfileUpdateDTO;
import fu.sba302.security.CustomUserDetails;
import fu.sba302.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * @author HuyTran - SE1910
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final CustomerService customerService;

    public ProfileController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public ResponseEntity<ProfileDTO> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        ProfileDTO profile = customerService.getProfile(userDetails.getUsername());
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<ProfileDTO> updateProfile(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                    @Valid @RequestBody ProfileUpdateDTO request) {
        ProfileDTO updated = customerService.updateProfile(userDetails.getUsername(), request);
        return ResponseEntity.ok(updated);
    }
}

