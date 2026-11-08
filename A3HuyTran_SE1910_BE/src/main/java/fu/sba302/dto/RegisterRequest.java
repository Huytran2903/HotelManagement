package fu.sba302.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * @author HuyTran - SE1910
 */
public class RegisterRequest {

    @NotBlank(message = "Customer full name is required")
    @Size(max = 50, message = "Name cannot exceed 50 characters")
    private String customerFullName;

    @NotBlank(message = "Telephone is required")
    @Pattern(
        regexp = "^(0|\\+84)(3|5|7|8|9)\\d{8}$",
        message = "Telephone must be a valid Vietnamese phone number (10 digits starting with 03, 05, 07, 08, 09 or +84)"
    )
    private String telephone;

    @NotBlank(message = "Email address is required")
    @Email(message = "Invalid email format")
    @Size(max = 100, message = "Email cannot exceed 100 characters")
    private String emailAddress;

    @NotNull(message = "Date of birth is required")
    private LocalDate customerBirthday;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    public RegisterRequest() {
    }

    public String getCustomerFullName() {
        return customerFullName;
    }

    public void setCustomerFullName(String customerFullName) {
        this.customerFullName = customerFullName;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public LocalDate getCustomerBirthday() {
        return customerBirthday;
    }

    public void setCustomerBirthday(LocalDate customerBirthday) {
        this.customerBirthday = customerBirthday;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}

