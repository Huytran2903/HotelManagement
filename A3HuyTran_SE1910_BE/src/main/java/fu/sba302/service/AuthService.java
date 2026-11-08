package fu.sba302.service;

import fu.sba302.dto.LoginRequest;
import fu.sba302.dto.LoginResponse;
import fu.sba302.dto.RegisterRequest;
import fu.sba302.dto.CustomerDTO;
import fu.sba302.entity.Customer;
import fu.sba302.exception.BusinessRuleException;
import fu.sba302.exception.DuplicateResourceException;
import fu.sba302.repository.CustomerRepository;
import fu.sba302.security.CustomUserDetailsService;
import fu.sba302.security.JwtUtils;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * @author HuyTran - SE1910
 */
@Service
public class AuthService {

    private final CustomerRepository customerRepository;
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    public AuthService(CustomerRepository customerRepository,
                       CustomUserDetailsService customUserDetailsService,
                       JwtUtils jwtUtils,
                       PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.customUserDetailsService = customUserDetailsService;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim();
        String password = request.getPassword();

        // 1. Check Staff Account
        if (customUserDetailsService.getStaffEmail() != null &&
            customUserDetailsService.getStaffEmail().equalsIgnoreCase(email)) {
            if (!passwordEncoder.matches(password, customUserDetailsService.getStaffPassword())) {
                throw new BadCredentialsException("Invalid email or password");
            }
            String token = jwtUtils.generateToken(email, "STAFF", customUserDetailsService.getStaffName(), null);
            return new LoginResponse(token, "STAFF", email, customUserDetailsService.getStaffName(), null);
        }

        // 2. Check Customer Account
        Customer customer = customerRepository.findByEmailAddressIgnoreCase(email)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(password, customer.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (customer.getCustomerStatus() == null || customer.getCustomerStatus() != 1) {
            throw new BusinessRuleException("Your account is inactive. Please contact hotel staff.");
        }

        String token = jwtUtils.generateToken(customer.getEmailAddress(), "CUSTOMER", customer.getCustomerFullName(), customer.getCustomerId());
        return new LoginResponse(token, "CUSTOMER", customer.getEmailAddress(), customer.getCustomerFullName(), customer.getCustomerId());
    }

    @Transactional
    public CustomerDTO register(RegisterRequest request) {
        String email = request.getEmailAddress().trim();

        if (customUserDetailsService.getStaffEmail() != null &&
            customUserDetailsService.getStaffEmail().equalsIgnoreCase(email)) {
            throw new DuplicateResourceException("This email address cannot be registered");
        }

        if (customerRepository.existsByEmailAddressIgnoreCase(email)) {
            throw new DuplicateResourceException("Email address is already in use: " + email);
        }

        // Validate birthday and age (must be >= 18 years old)
        if (request.getCustomerBirthday() == null) {
            throw new BusinessRuleException("Date of birth is required");
        }
        if (request.getCustomerBirthday().isAfter(java.time.LocalDate.now().minusYears(18))) {
            throw new BusinessRuleException("Customer must be at least 18 years old to register");
        }
        if (request.getCustomerBirthday().isBefore(java.time.LocalDate.now().minusYears(120))) {
            throw new BusinessRuleException("Date of birth is invalid");
        }

        Customer customer = new Customer();
        customer.setCustomerFullName(request.getCustomerFullName().trim());
        customer.setTelephone(request.getTelephone() != null ? request.getTelephone().trim() : null);
        customer.setEmailAddress(email);
        customer.setCustomerBirthday(request.getCustomerBirthday());
        customer.setCustomerStatus(1); // Active by default
        customer.setPassword(passwordEncoder.encode(request.getPassword()));

        Customer saved = customerRepository.save(customer);

        CustomerDTO dto = new CustomerDTO();
        dto.setCustomerId(saved.getCustomerId());
        dto.setCustomerFullName(saved.getCustomerFullName());
        dto.setTelephone(saved.getTelephone());
        dto.setEmailAddress(saved.getEmailAddress());
        dto.setCustomerBirthday(saved.getCustomerBirthday());
        dto.setCustomerStatus(saved.getCustomerStatus());
        return dto;
    }
}

