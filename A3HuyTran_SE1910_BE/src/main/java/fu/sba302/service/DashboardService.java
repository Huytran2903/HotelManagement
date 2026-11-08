package fu.sba302.service;

import fu.sba302.dto.DashboardStatsDTO;
import fu.sba302.repository.BookingReservationRepository;
import fu.sba302.repository.CustomerRepository;
import fu.sba302.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

/**
 * @author HuyTran - SE1910
 */
@Service
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final RoomRepository roomRepository;
    private final BookingReservationRepository bookingReservationRepository;
    private final BookingService bookingService;

    public DashboardService(CustomerRepository customerRepository,
                            RoomRepository roomRepository,
                            BookingReservationRepository bookingReservationRepository,
                            BookingService bookingService) {
        this.customerRepository = customerRepository;
        this.roomRepository = roomRepository;
        this.bookingReservationRepository = bookingReservationRepository;
        this.bookingService = bookingService;
    }

    public DashboardStatsDTO getDashboardStats() {
        long totalCustomers = customerRepository.count();
        long totalRooms = roomRepository.count();
        long activeRooms = roomRepository.findByRoomStatus(1).size();
        long totalBookings = bookingReservationRepository.countTotalBookings();
        Double sumRevenue = bookingReservationRepository.sumTotalRevenue();
        double totalRevenue = sumRevenue != null ? sumRevenue : 0.0;

        var recentBookings = bookingReservationRepository.searchBookings(null, null).stream()
                .limit(5)
                .map(bookingService::toResponse)
                .collect(Collectors.toList());

        return new DashboardStatsDTO(totalCustomers, totalRooms, activeRooms, totalBookings, totalRevenue, recentBookings);
    }
}

