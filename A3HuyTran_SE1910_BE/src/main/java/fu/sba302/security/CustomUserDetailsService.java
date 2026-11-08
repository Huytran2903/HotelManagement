package fu.sba302.security;

import fu.sba302.entity.Customer;
import fu.sba302.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * @author HuyTran - SE1910
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final CustomerRepository customerRepository;

    @Value("${app.staff.email:admin@fuhotel.com}")
    private String staffEmail;

    @Value("${app.staff.password:Staff@123}")
    private String staffPassword;

    @Value("${app.staff.name:Staff Administrator}")
    private String staffName;

    public CustomUserDetailsService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public String getStaffEmail() {
        return staffEmail;
    }

    public String getStaffPassword() {
        return staffPassword;
    }

    public String getStaffName() {
        return staffName;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        if (staffEmail != null && staffEmail.equalsIgnoreCase(email)) {
            return CustomUserDetails.createStaff(staffEmail, staffPassword, staffName);
        }

        Customer customer = customerRepository.findByEmailAddressIgnoreCase(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return CustomUserDetails.createCustomer(customer);
    }
}

