package fu.sba302.repository;

import fu.sba302.entity.BookingReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * @author HuyTran - SE1910
 */
@Repository
public interface BookingReservationRepository extends JpaRepository<BookingReservation, Integer> {

    List<BookingReservation> findByCustomer_CustomerIdOrderByBookingDateDescBookingReservationIdDesc(Integer customerId);

    @Query("SELECT b FROM BookingReservation b WHERE " +
           "(:keyword IS NULL OR LOWER(b.customer.customerFullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(b.customer.emailAddress) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:status IS NULL OR b.bookingStatus = :status) " +
           "ORDER BY b.bookingReservationId DESC")
    List<BookingReservation> searchBookings(@Param("keyword") String keyword, @Param("status") Integer status);

    @Query("SELECT COUNT(b) FROM BookingReservation b")
    long countTotalBookings();

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0) FROM BookingReservation b WHERE b.bookingStatus = 1")
    Double sumTotalRevenue();
}

