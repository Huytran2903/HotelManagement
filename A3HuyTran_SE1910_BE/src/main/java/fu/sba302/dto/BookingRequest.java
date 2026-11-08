package fu.sba302.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

/**
 * @author HuyTran - SE1910
 */
public class BookingRequest {

    // Nullable if authenticated customer creates their own booking
    private Integer customerId;

    @NotEmpty(message = "At least one room must be selected for booking")
    @Valid
    private List<BookingItemRequest> items;

    public BookingRequest() {
    }

    public BookingRequest(Integer customerId, List<BookingItemRequest> items) {
        this.customerId = customerId;
        this.items = items;
    }

    public Integer getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Integer customerId) {
        this.customerId = customerId;
    }

    public List<BookingItemRequest> getItems() {
        return items;
    }

    public void setItems(List<BookingItemRequest> items) {
        this.items = items;
    }
}

