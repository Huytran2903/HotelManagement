package fu.sba302.config;

import fu.sba302.entity.*;
import fu.sba302.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * @author HuyTran - SE1910
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final CustomerRepository customerRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;
    private final BookingReservationRepository bookingReservationRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(CustomerRepository customerRepository,
                           RoomTypeRepository roomTypeRepository,
                           RoomRepository roomRepository,
                           BookingReservationRepository bookingReservationRepository,
                           BookingDetailRepository bookingDetailRepository,
                           PasswordEncoder passwordEncoder) {
        this.customerRepository = customerRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.roomRepository = roomRepository;
        this.bookingReservationRepository = bookingReservationRepository;
        this.bookingDetailRepository = bookingDetailRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (roomTypeRepository.count() == 0) {
            RoomType standard = new RoomType("Standard Room", "Standard Single/Double Room with essential hotel amenities", "Standard tier");
            RoomType deluxe = new RoomType("Deluxe Room", "Spacious Deluxe Room with city view, king bed and minibar", "Deluxe tier");
            RoomType executive = new RoomType("Executive Suite", "Luxury Suite with living room, kitchenette and panoramic city view", "VIP tier");
            RoomType family = new RoomType("Family Suite", "Large family suite accommodating up to 4 guests with double bedrooms", "Family tier");

            roomTypeRepository.saveAll(List.of(standard, deluxe, executive, family));
        }

        if (roomRepository.count() == 0) {
            List<RoomType> types = roomTypeRepository.findAll();
            RoomType standard = types.stream().filter(t -> t.getRoomTypeName().contains("Standard")).findFirst().orElse(types.get(0));
            RoomType deluxe = types.stream().filter(t -> t.getRoomTypeName().contains("Deluxe")).findFirst().orElse(types.get(0));
            RoomType executive = types.stream().filter(t -> t.getRoomTypeName().contains("Executive")).findFirst().orElse(types.get(0));
            RoomType family = types.stream().filter(t -> t.getRoomTypeName().contains("Family")).findFirst().orElse(types.get(0));

            Room r101 = new Room("101", "Cozy ground floor standard room with garden view", 2, standard, 1, BigDecimal.valueOf(50.00));
            Room r102 = new Room("102", "Quiet standard room with double bed and work desk", 2, standard, 1, BigDecimal.valueOf(50.00));
            Room r201 = new Room("201", "Spacious deluxe room with balcony and king size bed", 2, deluxe, 1, BigDecimal.valueOf(85.00));
            Room r202 = new Room("202", "Deluxe room with city view, bathtub and premium furnishings", 3, deluxe, 1, BigDecimal.valueOf(95.00));
            Room r301 = new Room("301", "Top floor luxury executive suite with private lounge", 4, executive, 1, BigDecimal.valueOf(150.00));
            Room r302 = new Room("302", "Spacious family suite with 2 queen beds and kitchenette", 4, family, 1, BigDecimal.valueOf(130.00));

            roomRepository.saveAll(List.of(r101, r102, r201, r202, r301, r302));
        }

        if (customerRepository.count() == 0) {
            Customer c1 = new Customer(
                    "Nguyen Van An",
                    "0901234567",
                    "customer1@fuhotel.com",
                    LocalDate.of(1995, 5, 15),
                    1,
                    passwordEncoder.encode("Customer@123")
            );

            Customer c2 = new Customer(
                    "Tran Thi Binh",
                    "0912345678",
                    "customer2@fuhotel.com",
                    LocalDate.of(1998, 8, 20),
                    1,
                    passwordEncoder.encode("Customer@123")
            );

            customerRepository.saveAll(List.of(c1, c2));

            // Create a sample past booking for customer 1
            Room r101 = roomRepository.findByRoomNumberIgnoreCase("101").orElse(null);
            if (r101 != null) {
                BookingReservation reservation = new BookingReservation(
                        LocalDate.now().minusDays(5),
                        BigDecimal.valueOf(100.00),
                        c1,
                        1
                );
                BookingReservation savedRes = bookingReservationRepository.saveAndFlush(reservation);

                BookingDetail detail = new BookingDetail(
                        savedRes,
                        r101,
                        LocalDate.now().minusDays(4),
                        LocalDate.now().minusDays(2),
                        BigDecimal.valueOf(100.00)
                );
                savedRes.addBookingDetail(detail);
                bookingReservationRepository.save(savedRes);
            }
        }
    }
}
