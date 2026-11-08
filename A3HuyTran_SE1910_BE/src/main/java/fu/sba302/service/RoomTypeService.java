package fu.sba302.service;

import fu.sba302.dto.RoomTypeDTO;
import fu.sba302.entity.RoomType;
import fu.sba302.exception.BusinessRuleException;
import fu.sba302.exception.ResourceNotFoundException;
import fu.sba302.repository.RoomTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * @author HuyTran - SE1910
 */
@Service
public class RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;

    public RoomTypeService(RoomTypeRepository roomTypeRepository) {
        this.roomTypeRepository = roomTypeRepository;
    }

    public List<RoomTypeDTO> getAllRoomTypes() {
        return roomTypeRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public RoomTypeDTO getRoomTypeById(Integer id) {
        RoomType rt = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found with ID: " + id));
        return toDTO(rt);
    }

    @Transactional
    public RoomTypeDTO createRoomType(RoomTypeDTO dto) {
        RoomType rt = new RoomType();
        rt.setRoomTypeName(dto.getRoomTypeName().trim());
        rt.setTypeDescription(dto.getTypeDescription());
        rt.setTypeNote(dto.getTypeNote());
        return toDTO(roomTypeRepository.save(rt));
    }

    @Transactional
    public RoomTypeDTO updateRoomType(Integer id, RoomTypeDTO dto) {
        RoomType rt = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found with ID: " + id));
        rt.setRoomTypeName(dto.getRoomTypeName().trim());
        rt.setTypeDescription(dto.getTypeDescription());
        rt.setTypeNote(dto.getTypeNote());
        return toDTO(roomTypeRepository.save(rt));
    }

    @Transactional
    public void deleteRoomType(Integer id) {
        RoomType rt = roomTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room type not found with ID: " + id));
        if (!rt.getRooms().isEmpty()) {
            throw new BusinessRuleException("Cannot delete room type with associated rooms");
        }
        roomTypeRepository.delete(rt);
    }

    private RoomTypeDTO toDTO(RoomType rt) {
        return new RoomTypeDTO(rt.getRoomTypeId(), rt.getRoomTypeName(), rt.getTypeDescription(), rt.getTypeNote());
    }
}

