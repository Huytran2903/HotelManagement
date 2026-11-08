package fu.sba302.repository;

import fu.sba302.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * @author HuyTran - SE1910
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Integer> {

    Optional<Room> findByRoomNumberIgnoreCase(String roomNumber);

    boolean existsByRoomNumberIgnoreCase(String roomNumber);

    @Query("SELECT r FROM Room r WHERE " +
           "(:keyword IS NULL OR LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(r.roomDetailDescription) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:roomTypeId IS NULL OR r.roomType.roomTypeId = :roomTypeId) " +
           "AND (:status IS NULL OR r.roomStatus = :status) " +
           "ORDER BY r.roomId ASC")
    List<Room> searchRooms(@Param("keyword") String keyword,
                           @Param("roomTypeId") Integer roomTypeId,
                           @Param("status") Integer status);

    List<Room> findByRoomStatus(Integer roomStatus);
}

