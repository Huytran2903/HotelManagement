package fu.sba302.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * @author HuyTran - SE1910
 */
public class ProfileUpdateDTO {

    @NotBlank(message = "Customer full name is required")
    @Size(max = 50, message = "Name cannot exceed 50 characters")
    private String customerFullName;

    @Pattern(
        regexp = "^$|^(0|\\+84)(3|5|7|8|9)\\d{8}$",
        message = "Telephone must be a valid Vietnamese phone number (10 digits starting with 03, 05, 07, 08, 09 or +84)"
    )
    private String telephone;

    private LocalDate customerBirthday;

    // Optional: if provided, update password
    private String newPassword;

    public ProfileUpdateDTO() {
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

    public LocalDate getCustomerBirthday() {
        return customerBirthday;
    }

    public void setCustomerBirthday(LocalDate customerBirthday) {
        this.customerBirthday = customerBirthday;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}

