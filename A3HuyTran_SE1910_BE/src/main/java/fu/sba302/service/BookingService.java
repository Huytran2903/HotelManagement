package fu.sba302.service;

import fu.sba302.dto.BookingDetailDTO;
import fu.sba302.dto.BookingItemRequest;
import fu.sba302.dto.BookingRequest;
import fu.sba302.dto.BookingResponse;
import fu.sba302.entity.BookingDetail;
import fu.sba302.entity.BookingReservation;
import fu.sba302.entity.Customer;
import fu.sba302.entity.Room;
import fu.sba302.exception.BusinessRuleException;
import fu.sba302.exception.ResourceNotFoundException;
import fu.sba302.repository.BookingDetailRepository;
import fu.sba302.repository.BookingReservationRepository;
import fu.sba302.repository.CustomerRepository;
import fu.sba302.repository.RoomRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author HuyTran - SE1910
 */
@Service
public class BookingService {

    private final BookingReservationRepository bookingReservationRepository;
    private final BookingDetailRepository bookingDetailRepository;
    private final CustomerRepository customerRepository;
    private final RoomRepository roomRepository;

    public BookingService(BookingReservationRepository bookingReservationRepository,
                          BookingDetailRepository bookingDetailRepository,
                          CustomerRepository customerRepository,
                          RoomRepository roomRepository) {
        this.bookingReservationRepository = bookingReservationRepository;
        this.bookingDetailRepository = bookingDetailRepository;
        this.customerRepository = customerRepository;
        this.roomRepository = roomRepository;
    }

    public List<BookingResponse> getAllBookings(String keyword, Integer status) {
        return bookingReservationRepository.searchBookings(keyword, status).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getCustomerBookingHistory(Integer customerId) {
        return bookingReservationRepository.findByCustomer_CustomerIdOrderByBookingDateDescBookingReservationIdDesc(customerId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Integer id, String role, Integer currentCustomerId) {
        BookingReservation booking = bookingReservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking reservation not found with ID: " + id));

        // Enforce customer isolation
        if ("CUSTOMER".equalsIgnoreCase(role)) {
            if (currentCustomerId == null || !booking.getCustomer().getCustomerId().equals(currentCustomerId)) {
                throw new AccessDeniedException("You do not have permission to access this booking reservation");
            }
        }

        return toResponse(booking);
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String role, Integer currentCustomerId) {
        Integer targetCustomerId;
        if ("CUSTOMER".equalsIgnoreCase(role)) {
            targetCustomerId = currentCustomerId;
        } else {
            // Staff can book for any customer
            targetCustomerId = request.getCustomerId();
            if (targetCustomerId == null) {
                throw new BusinessRuleException("Customer ID is required when booking as staff");
            }
        }

        Customer customer = customerRepository.findById(targetCustomerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + targetCustomerId));

        if (customer.getCustomerStatus() == null || customer.getCustomerStatus() != 1) {
            throw new BusinessRuleException("Customer account is inactive and cannot make bookings");
        }

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessRuleException("At least one room must be selected for booking");
        }

        // Validate items and check room availability
        Set<Integer> uniqueRoomIds = new HashSet<>();
        List<BookingDetail> details = new ArrayList<>();
        BigDecimal calculatedTotal = BigDecimal.ZERO;

        BookingReservation reservation = new BookingReservation();
        reservation.setBookingDate(LocalDate.now());
        reservation.setCustomer(customer);
        reservation.setBookingStatus(1); // 1 = Confirmed / Active

        BookingReservation savedReservation = bookingReservationRepository.saveAndFlush(reservation);

        for (BookingItemRequest item : request.getItems()) {
            if (!uniqueRoomIds.add(item.getRoomId())) {
                throw new BusinessRuleException("Room " + item.getRoomId() + " cannot be booked multiple times in the same transaction");
            }

            if (item.getStartDate() == null || item.getEndDate() == null) {
                throw new BusinessRuleException("Start date and end date are required for each room");
            }

            if (!item.getEndDate().isAfter(item.getStartDate())) {
                throw new BusinessRuleException("End date must be strictly after start date for room ID " + item.getRoomId());
            }

            Room room = roomRepository.findById(item.getRoomId())
                    .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + item.getRoomId()));

            if (room.getRoomStatus() == null || room.getRoomStatus() != 1) {
                throw new BusinessRuleException("Room " + room.getRoomNumber() + " is currently unavailable");
            }

            // Check availability overlap in active reservations
            boolean isBooked = bookingDetailRepository.isRoomBookedOverlap(room.getRoomId(), item.getStartDate(), item.getEndDate());
            if (isBooked) {
                throw new BusinessRuleException("Room " + room.getRoomNumber() + " is already booked between " +
                        item.getStartDate() + " and " + item.getEndDate());
            }

            long days = ChronoUnit.DAYS.between(item.getStartDate(), item.getEndDate());
            if (days <= 0) days = 1;

            BigDecimal itemPrice = room.getRoomPricePerDay().multiply(BigDecimal.valueOf(days));
            calculatedTotal = calculatedTotal.add(itemPrice);

            BookingDetail detail = new BookingDetail(savedReservation, room, item.getStartDate(), item.getEndDate(), itemPrice);
            savedReservation.addBookingDetail(detail);
        }

        savedReservation.setTotalPrice(calculatedTotal);
        BookingReservation resultReservation = bookingReservationRepository.save(savedReservation);

        return toResponse(resultReservation);
    }

    @Transactional
    public BookingResponse updateBookingStatus(Integer id, Integer status) {
        BookingReservation booking = bookingReservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking reservation not found with ID: " + id));

        booking.setBookingStatus(status);
        return toResponse(bookingReservationRepository.save(booking));
    }

    @Transactional
    public void deleteBooking(Integer id) {
        BookingReservation booking = bookingReservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking reservation not found with ID: " + id));

        // Soft delete / cancel or hard delete
        bookingReservationRepository.delete(booking);
    }

    public BookingResponse toResponse(BookingReservation booking) {
        BookingResponse res = new BookingResponse();
        res.setBookingReservationId(booking.getBookingReservationId());
        res.setBookingDate(booking.getBookingDate());
        res.setTotalPrice(booking.getTotalPrice());
        res.setBookingStatus(booking.getBookingStatus());

        if (booking.getCustomer() != null) {
            res.setCustomerId(booking.getCustomer().getCustomerId());
            res.setCustomerFullName(booking.getCustomer().getCustomerFullName());
            res.setCustomerEmail(booking.getCustomer().getEmailAddress());
            res.setCustomerTelephone(booking.getCustomer().getTelephone());
        }

        List<BookingDetail> details = bookingDetailRepository.findByBookingReservation_BookingReservationId(booking.getBookingReservationId());
        List<BookingDetailDTO> detailDTOs = details.stream().map(d -> {
            BookingDetailDTO dto = new BookingDetailDTO();
            dto.setBookingReservationId(booking.getBookingReservationId());
            dto.setRoomId(d.getRoom().getRoomId());
            dto.setRoomNumber(d.getRoom().getRoomNumber());
            dto.setRoomTypeName(d.getRoom().getRoomType() != null ? d.getRoom().getRoomType().getRoomTypeName() : "");
            dto.setRoomPricePerDay(d.getRoom().getRoomPricePerDay());
            dto.setStartDate(d.getStartDate());
            dto.setEndDate(d.getEndDate());
            long days = ChronoUnit.DAYS.between(d.getStartDate(), d.getEndDate());
            dto.setNumberOfDays(days);
            dto.setActualPrice(d.getActualPrice());
            return dto;
        }).collect(Collectors.toList());

        res.setBookingDetails(detailDTOs);
        return res;
    }
}
