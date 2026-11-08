package fu.sba302.service;

import fu.sba302.dto.RoomDTO;
import fu.sba302.entity.Room;
import fu.sba302.entity.RoomType;
import fu.sba302.exception.BusinessRuleException;
import fu.sba302.exception.DuplicateResourceException;
import fu.sba302.exception.ResourceNotFoundException;
import fu.sba302.repository.BookingDetailRepository;
import fu.sba302.repository.RoomRepository;
import fu.sba302.repository.RoomTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author HuyTran - SE1910
 */
@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final BookingDetailRepository bookingDetailRepository;

    public RoomService(RoomRepository roomRepository,
                       RoomTypeRepository roomTypeRepository,
                       BookingDetailRepository bookingDetailRepository) {
        this.roomRepository = roomRepository;
        this.roomTypeRepository = roomTypeRepository;
        this.bookingDetailRepository = bookingDetailRepository;
    }

    public List<RoomDTO> getAllRooms(String keyword, Integer roomTypeId, Integer status) {
        return roomRepository.searchRooms(keyword, roomTypeId, status).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<RoomDTO> getActiveRooms() {
        return roomRepository.findByRoomStatus(1).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public RoomDTO getRoomById(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));
        return toDTO(room);
    }

    @Transactional
    public RoomDTO createRoom(RoomDTO dto) {
        String roomNumber = dto.getRoomNumber().trim();
        if (roomRepository.existsByRoomNumberIgnoreCase(roomNumber)) {
            throw new DuplicateResourceException("Room number already exists: " + roomNumber);
        }

        RoomType roomType = roomTypeRepository.findById(dto.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found with ID: " + dto.getRoomTypeId()));

        Room room = new Room();
        room.setRoomNumber(roomNumber);
        room.setRoomDetailDescription(dto.getRoomDetailDescription());
        room.setRoomMaxCapacity(dto.getRoomMaxCapacity());
        room.setRoomType(roomType);
        room.setRoomStatus(dto.getRoomStatus() != null ? dto.getRoomStatus() : 1);
        room.setRoomPricePerDay(dto.getRoomPricePerDay());

        return toDTO(roomRepository.save(room));
    }

    @Transactional
    public RoomDTO updateRoom(Integer id, RoomDTO dto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        String newRoomNumber = dto.getRoomNumber().trim();
        if (!room.getRoomNumber().equalsIgnoreCase(newRoomNumber)) {
            if (roomRepository.existsByRoomNumberIgnoreCase(newRoomNumber)) {
                throw new DuplicateResourceException("Room number already exists: " + newRoomNumber);
            }
            room.setRoomNumber(newRoomNumber);
        }

        RoomType roomType = roomTypeRepository.findById(dto.getRoomTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found with ID: " + dto.getRoomTypeId()));

        room.setRoomDetailDescription(dto.getRoomDetailDescription());
        room.setRoomMaxCapacity(dto.getRoomMaxCapacity());
        room.setRoomType(roomType);
        if (dto.getRoomStatus() != null) {
            room.setRoomStatus(dto.getRoomStatus());
        }
        room.setRoomPricePerDay(dto.getRoomPricePerDay());

        return toDTO(roomRepository.save(room));
    }

    @Transactional
    public String deleteRoom(Integer id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found with ID: " + id));

        boolean hasBookingTransactions = bookingDetailRepository.existsByRoom_RoomId(id);

        if (hasBookingTransactions) {
            // "If a room has already been used in a booking, change its status instead of deleting it."
            room.setRoomStatus(0); // Inactive/Deactivated
            roomRepository.save(room);
            return "Room has existing booking transactions; its status has been deactivated to Inactive instead of deletion.";
        } else {
            // "Delete room only if it has never been used in a booking transaction."
            roomRepository.delete(room);
            return "Room deleted successfully.";
        }
    }

    private RoomDTO toDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setRoomId(room.getRoomId());
        dto.setRoomNumber(room.getRoomNumber());
        dto.setRoomDetailDescription(room.getRoomDetailDescription());
        dto.setRoomMaxCapacity(room.getRoomMaxCapacity());
        dto.setRoomTypeId(room.getRoomType().getRoomTypeId());
        dto.setRoomTypeName(room.getRoomType().getRoomTypeName());
        dto.setRoomStatus(room.getRoomStatus());
        dto.setRoomPricePerDay(room.getRoomPricePerDay());
        return dto;
    }
}

