package fu.sba302.security;

import fu.sba302.entity.Customer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

/**
 * @author HuyTran - SE1910
 */
public class CustomUserDetails implements UserDetails {

    private final String email;
    private final String password;
    private final String fullName;
    private final String role; // "STAFF" or "CUSTOMER"
    private final Integer customerId;
    private final boolean enabled;

    public CustomUserDetails(String email, String password, String fullName, String role, Integer customerId, boolean enabled) {
        this.email = email;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.customerId = customerId;
        this.enabled = enabled;
    }

    public static CustomUserDetails createStaff(String email, String password, String name) {
        return new CustomUserDetails(email, password, name, "STAFF", null, true);
    }

    public static CustomUserDetails createCustomer(Customer customer) {
        boolean isEnabled = customer.getCustomerStatus() != null && customer.getCustomerStatus() == 1;
        return new CustomUserDetails(
                customer.getEmailAddress(),
                customer.getPassword(),
                customer.getCustomerFullName(),
                "CUSTOMER",
                customer.getCustomerId(),
                isEnabled
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }
}

