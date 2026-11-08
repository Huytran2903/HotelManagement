package fu.sba302.service;

import fu.sba302.dto.CustomerDTO;
import fu.sba302.dto.ProfileDTO;
import fu.sba302.dto.ProfileUpdateDTO;
import fu.sba302.entity.Customer;
import fu.sba302.exception.BusinessRuleException;
import fu.sba302.exception.DuplicateResourceException;
import fu.sba302.exception.ResourceNotFoundException;
import fu.sba302.repository.CustomerRepository;
import fu.sba302.security.CustomUserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author HuyTran - SE1910
 */
@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomUserDetailsService customUserDetailsService;
    private final PasswordEncoder passwordEncoder;

    public CustomerService(CustomerRepository customerRepository,
                           CustomUserDetailsService customUserDetailsService,
                           PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.customUserDetailsService = customUserDetailsService;
        this.passwordEncoder = passwordEncoder;
    }

    public List<CustomerDTO> getAllCustomers(String keyword) {
        List<Customer> list = (keyword != null && !keyword.trim().isEmpty())
                ? customerRepository.searchCustomers(keyword.trim())
                : customerRepository.findAll();

        return list.stream().map(this::toDTO).collect(Collectors.toList());
    }

    public CustomerDTO getCustomerById(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        return toDTO(customer);
    }

    @Transactional
    public CustomerDTO createCustomer(CustomerDTO dto) {
        String email = dto.getEmailAddress().trim();

        if (customUserDetailsService.getStaffEmail() != null &&
            customUserDetailsService.getStaffEmail().equalsIgnoreCase(email)) {
            throw new DuplicateResourceException("Email cannot be used");
        }

        if (customerRepository.existsByEmailAddressIgnoreCase(email)) {
            throw new DuplicateResourceException("Email already exists: " + email);
        }

        if (dto.getPassword() == null || dto.getPassword().trim().isEmpty()) {
            throw new BusinessRuleException("Password is required for new customer");
        }

        validateCustomerData(dto.getTelephone(), dto.getCustomerBirthday());

        Customer customer = new Customer();
        customer.setCustomerFullName(dto.getCustomerFullName().trim());
        customer.setTelephone(dto.getTelephone() != null ? dto.getTelephone().trim() : null);
        customer.setEmailAddress(email);
        customer.setCustomerBirthday(dto.getCustomerBirthday());
        customer.setCustomerStatus(dto.getCustomerStatus() != null ? dto.getCustomerStatus() : 1);
        customer.setPassword(passwordEncoder.encode(dto.getPassword().trim()));

        return toDTO(customerRepository.save(customer));
    }

    @Transactional
    public CustomerDTO updateCustomer(Integer id, CustomerDTO dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        String newEmail = dto.getEmailAddress().trim();
        if (!customer.getEmailAddress().equalsIgnoreCase(newEmail)) {
            if (customUserDetailsService.getStaffEmail() != null &&
                customUserDetailsService.getStaffEmail().equalsIgnoreCase(newEmail)) {
                throw new DuplicateResourceException("Email cannot be used");
            }
            if (customerRepository.existsByEmailAddressIgnoreCase(newEmail)) {
                throw new DuplicateResourceException("Email already exists: " + newEmail);
            }
            customer.setEmailAddress(newEmail);
        }

        customer.setCustomerFullName(dto.getCustomerFullName().trim());
        customer.setTelephone(dto.getTelephone() != null ? dto.getTelephone().trim() : null);
        customer.setCustomerBirthday(dto.getCustomerBirthday());
        if (dto.getCustomerStatus() != null) {
            customer.setCustomerStatus(dto.getCustomerStatus());
        }

        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            customer.setPassword(passwordEncoder.encode(dto.getPassword().trim()));
        }

        validateCustomerData(dto.getTelephone(), dto.getCustomerBirthday());

        return toDTO(customerRepository.save(customer));
    }

    @Transactional
    public void deleteCustomer(Integer id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        if (!customer.getBookingReservations().isEmpty()) {
            // Customer has booking history, deactivate instead of hard delete
            customer.setCustomerStatus(0);
            customerRepository.save(customer);
        } else {
            customerRepository.delete(customer);
        }
    }

    public ProfileDTO getProfile(String email) {
        if (customUserDetailsService.getStaffEmail() != null &&
            customUserDetailsService.getStaffEmail().equalsIgnoreCase(email)) {
            ProfileDTO dto = new ProfileDTO();
            dto.setCustomerFullName(customUserDetailsService.getStaffName());
            dto.setEmailAddress(customUserDetailsService.getStaffEmail());
            dto.setRole("STAFF");
            dto.setCustomerStatus(1);
            return dto;
        }

        Customer customer = customerRepository.findByEmailAddressIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));

        ProfileDTO dto = new ProfileDTO();
        dto.setCustomerId(customer.getCustomerId());
        dto.setCustomerFullName(customer.getCustomerFullName());
        dto.setTelephone(customer.getTelephone());
        dto.setEmailAddress(customer.getEmailAddress());
        dto.setCustomerBirthday(customer.getCustomerBirthday());
        dto.setCustomerStatus(customer.getCustomerStatus());
        dto.setRole("CUSTOMER");
        return dto;
    }

    @Transactional
    public ProfileDTO updateProfile(String email, ProfileUpdateDTO dto) {
        if (customUserDetailsService.getStaffEmail() != null &&
            customUserDetailsService.getStaffEmail().equalsIgnoreCase(email)) {
            throw new BusinessRuleException("Staff account details are managed in system configuration");
        }

        Customer customer = customerRepository.findByEmailAddressIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with email: " + email));

        customer.setCustomerFullName(dto.getCustomerFullName().trim());
        customer.setTelephone(dto.getTelephone() != null ? dto.getTelephone().trim() : null);
        customer.setCustomerBirthday(dto.getCustomerBirthday());

        if (dto.getNewPassword() != null && !dto.getNewPassword().trim().isEmpty()) {
            if (dto.getNewPassword().trim().length() < 6) {
                throw new BusinessRuleException("Password must be at least 6 characters");
            }
            customer.setPassword(passwordEncoder.encode(dto.getNewPassword().trim()));
        }

        validateCustomerData(dto.getTelephone(), dto.getCustomerBirthday());

        Customer saved = customerRepository.save(customer);

        ProfileDTO res = new ProfileDTO();
        res.setCustomerId(saved.getCustomerId());
        res.setCustomerFullName(saved.getCustomerFullName());
        res.setTelephone(saved.getTelephone());
        res.setEmailAddress(saved.getEmailAddress());
        res.setCustomerBirthday(saved.getCustomerBirthday());
        res.setCustomerStatus(saved.getCustomerStatus());
        res.setRole("CUSTOMER");
        return res;
    }

    private void validateCustomerData(String telephone, java.time.LocalDate birthday) {
        if (telephone != null && !telephone.trim().isEmpty()) {
            if (!telephone.trim().matches("^(0|\\+84)(3|5|7|8|9)\\d{8}$")) {
                throw new BusinessRuleException("Telephone must be a valid Vietnamese phone number (10 digits starting with 03, 05, 07, 08, 09 or +84)");
            }
        }
        if (birthday != null) {
            if (birthday.isAfter(java.time.LocalDate.now().minusYears(18))) {
                throw new BusinessRuleException("Customer must be at least 18 years old");
            }
            if (birthday.isBefore(java.time.LocalDate.now().minusYears(120))) {
                throw new BusinessRuleException("Date of birth is invalid");
            }
        }
    }

    private CustomerDTO toDTO(Customer customer) {
        CustomerDTO dto = new CustomerDTO();
        dto.setCustomerId(customer.getCustomerId());
        dto.setCustomerFullName(customer.getCustomerFullName());
        dto.setTelephone(customer.getTelephone());
        dto.setEmailAddress(customer.getEmailAddress());
        dto.setCustomerBirthday(customer.getCustomerBirthday());
        dto.setCustomerStatus(customer.getCustomerStatus());
        return dto;
    }
}

