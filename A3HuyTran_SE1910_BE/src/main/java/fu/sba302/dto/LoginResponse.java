package fu.sba302.dto;

/**
 * @author HuyTran - SE1910
 */
public class LoginResponse {

    private String token;
    private String type = "Bearer";
    private String role; // "STAFF" or "CUSTOMER"
    private String email;
    private String fullName;
    private Integer customerId; // null for staff

    public LoginResponse() {
    }

    public LoginResponse(String token, String role, String email, String fullName, Integer customerId) {
        this.token = token;
        this.role = role;
        this.email = email;
        this.fullName = fullName;
        this.customerId = customerId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }
}

