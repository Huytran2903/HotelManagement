package fu.sba302.repository;

import fu.sba302.entity.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * @author HuyTran - SE1910
 */
@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Integer> {
    Optional<RoomType> findByRoomTypeNameIgnoreCase(String roomTypeName);
}

