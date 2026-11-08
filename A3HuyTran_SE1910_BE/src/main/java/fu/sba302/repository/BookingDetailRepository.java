package fu.sba302.repository;

import fu.sba302.entity.BookingDetail;
import fu.sba302.entity.BookingDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * @author HuyTran - SE1910
 */
@Repository
public interface BookingDetailRepository extends JpaRepository<BookingDetail, BookingDetailId> {

    boolean existsByRoom_RoomId(Integer roomId);

    @Query("SELECT COUNT(bd) > 0 FROM BookingDetail bd " +
           "WHERE bd.room.roomId = :roomId " +
           "AND bd.bookingReservation.bookingStatus = 1 " +
           "AND bd.startDate < :endDate " +
           "AND bd.endDate > :startDate")
    boolean isRoomBookedOverlap(@Param("roomId") Integer roomId,
                                @Param("startDate") LocalDate startDate,
                                @Param("endDate") LocalDate endDate);

    List<BookingDetail> findByBookingReservation_BookingReservationId(Integer bookingReservationId);
}

