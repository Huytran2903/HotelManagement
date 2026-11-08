package fu.sba302;

import com.fasterxml.jackson.databind.ObjectMapper;
import fu.sba302.dto.*;
import fu.sba302.entity.Room;
import fu.sba302.entity.RoomType;
import fu.sba302.repository.CustomerRepository;
import fu.sba302.repository.RoomRepository;
import fu.sba302.repository.RoomTypeRepository;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * @author HuyTran - SE1910
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class FUMiniHotelIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomTypeRepository roomTypeRepository;

    @Autowired
    private CustomerRepository customerRepository;

    private static String staffToken;
    private static String customerToken;
    private static Integer createdCustomerId;
    private static Integer createdRoomId;
    private static Integer createdBookingId;

    @Test
    @Order(1)
    public void testStaffLogin_Success() throws Exception {
        LoginRequest req = new LoginRequest("admin@fuhotel.com", "Staff@123");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("STAFF"))
                .andReturn();

        LoginResponse resp = objectMapper.readValue(result.getResponse().getContentAsString(), LoginResponse.class);
        staffToken = resp.getToken();
        assertNotNull(staffToken);
    }

    @Test
    @Order(2)
    public void testCustomerRegistrationAndLogin_Success() throws Exception {
        String testEmail = "testuser" + System.currentTimeMillis() + "@fuhotel.com";
        RegisterRequest regReq = new RegisterRequest();
        regReq.setCustomerFullName("Test User Integration");
        regReq.setEmailAddress(testEmail);
        regReq.setTelephone("0988776655");
        regReq.setCustomerBirthday(LocalDate.of(2000, 1, 1));
        regReq.setPassword("Password@123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerId").isNumber())
                .andExpect(jsonPath("$.emailAddress").value(testEmail));

        // Login with new customer
        LoginRequest loginReq = new LoginRequest(testEmail, "Password@123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("CUSTOMER"))
                .andReturn();

        LoginResponse loginResp = objectMapper.readValue(loginResult.getResponse().getContentAsString(), LoginResponse.class);
        customerToken = loginResp.getToken();
        createdCustomerId = loginResp.getCustomerId();
        assertNotNull(customerToken);
        assertNotNull(createdCustomerId);
    }

    @Test
    @Order(3)
    public void testCustomerRegistration_ValidationRules() throws Exception {
        // Test 1: Invalid Vietnamese phone number format
        RegisterRequest invalidPhoneReq = new RegisterRequest();
        invalidPhoneReq.setCustomerFullName("Invalid Phone User");
        invalidPhoneReq.setEmailAddress("invalidphone" + System.currentTimeMillis() + "@fuhotel.com");
        invalidPhoneReq.setTelephone("12345678"); // Invalid VN format
        invalidPhoneReq.setCustomerBirthday(LocalDate.of(2000, 1, 1));
        invalidPhoneReq.setPassword("Password@123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidPhoneReq)))
                .andExpect(status().isBadRequest());

        // Test 2: Under 18 years old (born recently)
        RegisterRequest underageReq = new RegisterRequest();
        underageReq.setCustomerFullName("Underage User");
        underageReq.setEmailAddress("underage" + System.currentTimeMillis() + "@fuhotel.com");
        underageReq.setTelephone("0912345678");
        underageReq.setCustomerBirthday(LocalDate.now().minusYears(15)); // 15 years old
        underageReq.setPassword("Password@123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(underageReq)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @Order(4)
    public void testPublicRoomsEndpoints() throws Exception {
        mockMvc.perform(get("/api/public/rooms"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());

        mockMvc.perform(get("/api/public/room-types"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @Order(5)
    public void testCustomerProfile_GetAndUpdate() throws Exception {
        mockMvc.perform(get("/api/profile")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerId").value(createdCustomerId));

        ProfileUpdateDTO updateDTO = new ProfileUpdateDTO();
        updateDTO.setCustomerFullName("Test User Updated");
        updateDTO.setTelephone("0999999999");
        updateDTO.setCustomerBirthday(LocalDate.of(1999, 12, 31));

        mockMvc.perform(put("/api/profile")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customerFullName").value("Test User Updated"))
                .andExpect(jsonPath("$.telephone").value("0999999999"));
    }

    @Test
    @Order(6)
    public void testStaffCustomerManagement_AccessControl() throws Exception {
        // Customer should be forbidden from accessing staff customer management API
        mockMvc.perform(get("/api/customers")
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        // Staff can view customer list
        mockMvc.perform(get("/api/customers")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    @Order(7)
    public void testStaffRoomManagement_CRUD() throws Exception {
        List<RoomType> types = roomTypeRepository.findAll();
        assertFalse(types.isEmpty());

        RoomDTO roomDTO = new RoomDTO();
        roomDTO.setRoomNumber("TEST-" + System.currentTimeMillis() % 10000);
        roomDTO.setRoomDetailDescription("Test Room Description");
        roomDTO.setRoomMaxCapacity(2);
        roomDTO.setRoomTypeId(types.get(0).getRoomTypeId());
        roomDTO.setRoomStatus(1);
        roomDTO.setRoomPricePerDay(BigDecimal.valueOf(75.50));

        MvcResult createResult = mockMvc.perform(post("/api/rooms")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(roomDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.roomId").isNumber())
                .andReturn();

        RoomDTO createdRoom = objectMapper.readValue(createResult.getResponse().getContentAsString(), RoomDTO.class);
        createdRoomId = createdRoom.getRoomId();

        // Customer cannot delete room
        mockMvc.perform(delete("/api/rooms/" + createdRoomId)
                        .header("Authorization", "Bearer " + customerToken))
                .andExpect(status().isForbidden());

        // Staff can delete room (since it has never been in a booking)
        mockMvc.perform(delete("/api/rooms/" + createdRoomId)
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Room deleted successfully."));
    }

    @Test
    @Order(8)
    public void testCustomerBookingWorkflow_WithDateValidationAndPricing() throws Exception {
        List<Room> rooms = roomRepository.findByRoomStatus(1);
        assertTrue(rooms.size() >= 2);
        Room r1 = rooms.get(0);
        Room r2 = rooms.get(1);

        long offset = (System.currentTimeMillis() / 1000) % 500 + 10;
        LocalDate start = LocalDate.now().plusDays(offset);
        LocalDate end = start.plusDays(3); // 3 days

        BookingRequest bookingReq = new BookingRequest();
        bookingReq.setItems(List.of(
                new BookingItemRequest(r1.getRoomId(), start, end),
                new BookingItemRequest(r2.getRoomId(), start, end)
        ));

        MvcResult bookingResult = mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingReq)))
                .andReturn();

        if (bookingResult.getResponse().getStatus() != 201) {
            System.err.println("FAIL 201: " + bookingResult.getResponse().getContentAsString());
        }
        assertEquals(201, bookingResult.getResponse().getStatus());

        BookingResponse bookingResp = objectMapper.readValue(bookingResult.getResponse().getContentAsString(), BookingResponse.class);
        createdBookingId = bookingResp.getBookingReservationId();

        // Expected price = 3 * r1.price + 3 * r2.price
        BigDecimal expectedTotal = r1.getRoomPricePerDay().multiply(BigDecimal.valueOf(3))
                .add(r2.getRoomPricePerDay().multiply(BigDecimal.valueOf(3)));
        assertEquals(0, expectedTotal.compareTo(bookingResp.getTotalPrice()));

        // Test Overlapping Booking conflict
        mockMvc.perform(post("/api/bookings")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bookingReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("already booked")));

        // Test Deleting Room that is in a booking transaction (must deactivate status instead of deleting)
        mockMvc.perform(delete("/api/rooms/" + r1.getRoomId())
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("status has been deactivated to Inactive instead of deletion")));
    }

    @Test
    @Order(9)
    public void testCustomerIsolation_CannotAccessOtherBookings() throws Exception {
        // Customer 2 logs in
        LoginRequest loginReq = new LoginRequest("customer2@fuhotel.com", "Customer@123");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        LoginResponse loginResp = objectMapper.readValue(loginResult.getResponse().getContentAsString(), LoginResponse.class);
        String customer2Token = loginResp.getToken();

        // Customer 2 cannot access booking created by customer 1
        mockMvc.perform(get("/api/bookings/" + createdBookingId)
                        .header("Authorization", "Bearer " + customer2Token))
                .andExpect(status().isForbidden());

        // But Staff can access any booking
        mockMvc.perform(get("/api/bookings/" + createdBookingId)
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingReservationId").value(createdBookingId));
    }

    @Test
    @Order(10)
    public void testStaffDashboardStats() throws Exception {
        mockMvc.perform(get("/api/dashboard/stats")
                        .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalCustomers").isNumber())
                .andExpect(jsonPath("$.totalRooms").isNumber())
                .andExpect(jsonPath("$.totalBookings").isNumber());
    }
}
